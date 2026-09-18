/**
 * Governed building-library evolution contract.
 *
 * Models how a user's stated design intent can derive a private candidate
 * variant from an already-approved parent shell, without ever treating that
 * derivation as "training" on the tenant's private data, and without ever
 * asserting engineering verification the system has not actually performed.
 *
 * Everything in this module is a pure, deterministic function over plain
 * data: parameter deltas are computed by diffing structured facets, variant
 * identity is a content hash, and every state transition that would matter
 * to a human (promotion, verification, issue) requires an external evidence
 * record to be supplied by the caller — this module never manufactures that
 * evidence, and never calls a generative model to produce geometry, text or
 * imagery. It has no UI and no dependency on any other package.
 */

export const LIBRARY_EVOLUTION_SCHEMA = 'ferrum.library-evolution-contract.v1' as const

// ---------------------------------------------------------------------------
// Lineage
// ---------------------------------------------------------------------------

/** Where a candidate variant comes from: an approved parent template, and
 * optionally an approved parent variant it was itself derived from. */
export type ParentLineage = {
  parentTemplateId: string
  parentTemplateVersion: string
  parentVariantId: string | null
  /** Number of approved-variant hops back to the root template. 0 = derived directly from the template. */
  depth: number
}

export function deriveLineage(
  parentTemplateId: string,
  parentTemplateVersion: string,
  parentVariant: { variantId: string; lineage: ParentLineage } | null,
): ParentLineage {
  return {
    parentTemplateId,
    parentTemplateVersion,
    parentVariantId: parentVariant?.variantId ?? null,
    depth: parentVariant ? parentVariant.lineage.depth + 1 : 0,
  }
}

// ---------------------------------------------------------------------------
// Intent facets
// ---------------------------------------------------------------------------

/** A structured, normalizable statement of what the user is asking for.
 * Deliberately facet-based (not free text) so it can be diffed and hashed
 * deterministically instead of interpreted by a model. */
export type IntentFacets = {
  buildingType: string
  programme: string[]
  occupancy: string
  targetFloorCount: number
  targetGrossFloorAreaSqm: number
  materialPreferences: string[]
  openingPreferences: string[]
  structuralSystemPreference: string | null
}

const normalizeToken = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ')
const normalizeList = (values: string[]) => Array.from(new Set(values.map(normalizeToken))).sort()

function canonicalizeFacets(facets: IntentFacets): string {
  return JSON.stringify({
    buildingType: normalizeToken(facets.buildingType),
    programme: normalizeList(facets.programme),
    occupancy: normalizeToken(facets.occupancy),
    targetFloorCount: facets.targetFloorCount,
    targetGrossFloorAreaSqm: facets.targetGrossFloorAreaSqm,
    materialPreferences: normalizeList(facets.materialPreferences),
    openingPreferences: normalizeList(facets.openingPreferences),
    structuralSystemPreference: facets.structuralSystemPreference ? normalizeToken(facets.structuralSystemPreference) : null,
  })
}

/** FNV-1a 32-bit — deterministic, dependency-free, sufficient for a
 * non-cryptographic dedup/identity key over small structured payloads. */
function fnv1a32(value: string): string {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export function intentFingerprint(facets: IntentFacets): string {
  return `intent-fnv1a32:${fnv1a32(canonicalizeFacets(facets))}`
}

// ---------------------------------------------------------------------------
// Deterministic parameter deltas
// ---------------------------------------------------------------------------

export type ParameterDeltaKind = 'DIMENSION' | 'MATERIAL' | 'PROGRAMME' | 'OPENING' | 'STRUCTURAL_SYSTEM'

export type ParameterDelta = {
  path: string
  kind: ParameterDeltaKind
  fromValue: string | number | null
  toValue: string | number | null
}

/** Parent baseline expressed in the same facet shape as an intent, so a
 * delta is a plain structural diff — no inference, no free-text parsing. */
export type ParentBaselineFacets = {
  buildingTypes: string[]
  programme: string[]
  targetFloorCount: number
  targetGrossFloorAreaSqm: number
  materials: string[]
  openings: string[]
  structuralSystem: string | null
}

function arrayDelta(path: string, kind: ParameterDeltaKind, from: string[], to: string[]): ParameterDelta[] {
  const fromSet = new Set(normalizeList(from))
  const toSet = new Set(normalizeList(to))
  const deltas: ParameterDelta[] = []
  for (const added of Array.from(toSet)) if (!fromSet.has(added)) deltas.push({ path, kind, fromValue: null, toValue: added })
  for (const removed of Array.from(fromSet)) if (!toSet.has(removed)) deltas.push({ path, kind, fromValue: removed, toValue: null })
  return deltas
}

/** Pure, deterministic diff between a parent's baseline facets and the
 * user's requested intent facets. No model call; every delta traces back to
 * a literal field comparison. */
export function deriveParameterDeltas(parent: ParentBaselineFacets, intent: IntentFacets): ParameterDelta[] {
  const deltas: ParameterDelta[] = []

  if (!parent.buildingTypes.some((type) => normalizeToken(type) === normalizeToken(intent.buildingType))) {
    deltas.push({ path: 'buildingType', kind: 'PROGRAMME', fromValue: parent.buildingTypes[0] ?? null, toValue: intent.buildingType })
  }
  if (parent.targetFloorCount !== intent.targetFloorCount) {
    deltas.push({ path: 'targetFloorCount', kind: 'DIMENSION', fromValue: parent.targetFloorCount, toValue: intent.targetFloorCount })
  }
  if (parent.targetGrossFloorAreaSqm !== intent.targetGrossFloorAreaSqm) {
    deltas.push({ path: 'targetGrossFloorAreaSqm', kind: 'DIMENSION', fromValue: parent.targetGrossFloorAreaSqm, toValue: intent.targetGrossFloorAreaSqm })
  }
  deltas.push(...arrayDelta('programme', 'PROGRAMME', parent.programme, intent.programme))
  deltas.push(...arrayDelta('materials', 'MATERIAL', parent.materials, intent.materialPreferences))
  deltas.push(...arrayDelta('openings', 'OPENING', parent.openings, intent.openingPreferences))
  if (intent.structuralSystemPreference && normalizeToken(intent.structuralSystemPreference) !== normalizeToken(parent.structuralSystem ?? '')) {
    deltas.push({ path: 'structuralSystem', kind: 'STRUCTURAL_SYSTEM', fromValue: parent.structuralSystem, toValue: intent.structuralSystemPreference })
  }

  return deltas.sort((a, b) => a.path.localeCompare(b.path) || String(a.toValue).localeCompare(String(b.toValue)))
}

// ---------------------------------------------------------------------------
// Similarity / deduplication
// ---------------------------------------------------------------------------

function deltaSignature(delta: ParameterDelta): string {
  return `${delta.path}:${delta.kind}:${delta.fromValue ?? '∅'}->${delta.toValue ?? '∅'}`
}

/** Jaccard similarity over each candidate's delta-signature set. 1 = identical
 * parameter change-set; 0 = disjoint. Deterministic, order-independent. */
export function deltaSimilarity(a: readonly ParameterDelta[], b: readonly ParameterDelta[]): number {
  const setA = new Set(a.map(deltaSignature))
  const setB = new Set(b.map(deltaSignature))
  if (setA.size === 0 && setB.size === 0) return 1
  let intersection = 0
  for (const signature of Array.from(setA)) if (setB.has(signature)) intersection += 1
  const union = setA.size + setB.size - intersection
  return union === 0 ? 1 : intersection / union
}

export type DeduplicationMatch = {
  variantId: string
  similarity: number
  exactFingerprintMatch: boolean
}

/** Finds the closest existing sibling candidate (same parent template +
 * version + tenant) by intent fingerprint first, then delta similarity.
 * `threshold` is the minimum similarity to report a non-exact match. */
export function findSimilarVariant(
  candidate: { tenantId: string; parentTemplateId: string; parentTemplateVersion: string; intentFingerprint: string; deltas: readonly ParameterDelta[] },
  existing: readonly { variantId: string; tenantId: string; parentTemplateId: string; parentTemplateVersion: string; intentFingerprint: string; deltas: readonly ParameterDelta[] }[],
  threshold = 0.85,
): DeduplicationMatch | null {
  const siblings = existing.filter(
    (variant) =>
      variant.tenantId === candidate.tenantId &&
      variant.parentTemplateId === candidate.parentTemplateId &&
      variant.parentTemplateVersion === candidate.parentTemplateVersion,
  )

  const exact = siblings.find((variant) => variant.intentFingerprint === candidate.intentFingerprint)
  if (exact) return { variantId: exact.variantId, similarity: 1, exactFingerprintMatch: true }

  let best: DeduplicationMatch | null = null
  for (const variant of siblings) {
    const similarity = deltaSimilarity(candidate.deltas, variant.deltas)
    if (similarity >= threshold && (!best || similarity > best.similarity)) {
      best = { variantId: variant.variantId, similarity, exactFingerprintMatch: false }
    }
  }
  return best
}

// ---------------------------------------------------------------------------
// Provenance / licence
// ---------------------------------------------------------------------------

export type VariantProvenance = {
  derivedFrom: 'APPROVED_LIBRARY_TEMPLATE' | 'APPROVED_LIBRARY_VARIANT'
  copyrightBoundary: string
  generationMethod: 'DETERMINISTIC_PARAMETER_DERIVATION'
  createdAt: string
}

export type VariantLicence = {
  rightsBasis: 'TENANT_PRIVATE_DERIVATIVE' | 'FERRUM_LIBRARY_CONTRIBUTION'
  inheritedFromLicenceId: string
  reusableInPublicLibrary: boolean
  restrictions: string[]
}

export function deriveLicence(parentLicenceId: string, parentReusable: boolean): VariantLicence {
  return {
    rightsBasis: 'TENANT_PRIVATE_DERIVATIVE',
    inheritedFromLicenceId: parentLicenceId,
    // A private candidate is never publicly reusable on creation, regardless
    // of the parent's own reusability — publication is a separate, gated act.
    reusableInPublicLibrary: false,
    restrictions: parentReusable
      ? ['Private tenant candidate; not published until promotion is explicitly approved.']
      : ['Parent template is not itself licensed for public library reuse; this candidate inherits that restriction.'],
  }
}

// ---------------------------------------------------------------------------
// Privacy consent
// ---------------------------------------------------------------------------

export type PrivacyConsentState = 'NOT_GRANTED' | 'RETRIEVAL_ONLY' | 'TRAINING_OPT_IN'

export type PrivacyConsent = {
  state: PrivacyConsentState
  consentId: string | null
  grantedAt: string | null
}

/** The single rule this function exists to enforce: deriving a variant from
 * a tenant's private intent NEVER implies training consent. Consent must be
 * an explicit, separately recorded grant; silence defaults to NOT_GRANTED,
 * and RETRIEVAL_ONLY (using the candidate to serve that tenant) is likewise
 * never upgraded to TRAINING_OPT_IN by inference. */
export function resolvePrivacyConsent(explicitGrant: { consentId: string; grantedAt: string; state: PrivacyConsentState } | null): PrivacyConsent {
  if (!explicitGrant) return { state: 'NOT_GRANTED', consentId: null, grantedAt: null }
  return { state: explicitGrant.state, consentId: explicitGrant.consentId, grantedAt: explicitGrant.grantedAt }
}

// ---------------------------------------------------------------------------
// Validation state
// ---------------------------------------------------------------------------

export type ValidationState = 'GENERATED' | 'GEOMETRY_CHECKED' | 'ENGINEERING_VERIFIED' | 'APPROVED_FOR_ISSUE'

const VALIDATION_ORDER: readonly ValidationState[] = ['GENERATED', 'GEOMETRY_CHECKED', 'ENGINEERING_VERIFIED', 'APPROVED_FOR_ISSUE']

export type ValidationEvidence = {
  geometryCheckId: string | null
  engineeringVerificationId: string | null
  humanApprovalId: string | null
}

/** Computes the highest validation state the supplied evidence actually
 * supports. This function never advances state on its own — it only reads
 * evidence identifiers the caller supplies from a real check/review system.
 * No evidence in ⇒ GENERATED out, always. */
export function computeValidationState(evidence: ValidationEvidence): ValidationState {
  if (evidence.humanApprovalId && evidence.engineeringVerificationId && evidence.geometryCheckId) return 'APPROVED_FOR_ISSUE'
  if (evidence.engineeringVerificationId && evidence.geometryCheckId) return 'ENGINEERING_VERIFIED'
  if (evidence.geometryCheckId) return 'GEOMETRY_CHECKED'
  return 'GENERATED'
}

export function validationStateAtLeast(state: ValidationState, floor: ValidationState): boolean {
  return VALIDATION_ORDER.indexOf(state) >= VALIDATION_ORDER.indexOf(floor)
}

// ---------------------------------------------------------------------------
// Reuse eligibility
// ---------------------------------------------------------------------------

export type ReuseChannel = 'TENANT_PRIVATE_REUSE' | 'STRUCTURAL_REUSE' | 'BOQ_REUSE' | 'PUBLIC_LIBRARY_REUSE'

export type ReuseEligibility = {
  channel: ReuseChannel
  eligible: boolean
  reasons: string[]
}

/** A candidate is eligible for a reuse channel only when its validation
 * state, licence and consent actually support that channel — never on the
 * mere existence of the candidate. */
export function evaluateReuseEligibility(
  channel: ReuseChannel,
  validationState: ValidationState,
  licence: VariantLicence,
  consent: PrivacyConsent,
): ReuseEligibility {
  const reasons: string[] = []

  if (channel === 'TENANT_PRIVATE_REUSE') {
    return { channel, eligible: true, reasons: ['A private candidate is always reusable by the tenant that derived it.'] }
  }

  if (channel === 'STRUCTURAL_REUSE' || channel === 'BOQ_REUSE') {
    const requiredFloor: ValidationState = 'GEOMETRY_CHECKED'
    if (!validationStateAtLeast(validationState, requiredFloor)) reasons.push(`Requires at least ${requiredFloor}; current state is ${validationState}.`)
    return { channel, eligible: reasons.length === 0, reasons: reasons.length ? reasons : ['Geometry has been checked; downstream analysis may treat this as a bounded starting point, not a verified result.'] }
  }

  // PUBLIC_LIBRARY_REUSE
  if (!validationStateAtLeast(validationState, 'APPROVED_FOR_ISSUE')) reasons.push(`Requires APPROVED_FOR_ISSUE; current state is ${validationState}.`)
  if (!licence.reusableInPublicLibrary) reasons.push('Licence does not currently permit public library reuse.')
  if (consent.state !== 'TRAINING_OPT_IN') reasons.push('Public library contribution requires explicit TRAINING_OPT_IN consent, not merely RETRIEVAL_ONLY.')
  return { channel, eligible: reasons.length === 0, reasons: reasons.length ? reasons : ['Approved, licensed and explicitly consented for public library reuse.'] }
}

// ---------------------------------------------------------------------------
// Promotion gate
// ---------------------------------------------------------------------------

export type PromotionEvidence = {
  humanReviewerId: string | null
  humanApprovalId: string | null
  engineeringVerificationId: string | null
  geometryCheckId: string | null
  licenceReviewId: string | null
  privacyReviewId: string | null
  deduplicationCheckPassed: boolean
}

export type PromotionGateResult = {
  allowed: boolean
  blockingReasons: string[]
}

/** A private candidate may only be promoted to a shared library version
 * behind a hard human-review gate. This function only ever reports whether
 * the gate is satisfied — it never performs, simulates or shortcuts the
 * review itself, and it never asserts engineering verification beyond what
 * `engineeringVerificationId` actually records. */
export function evaluatePromotionGate(
  candidate: { libraryState: 'PRIVATE_CANDIDATE' | 'PROMOTION_REVIEW' | 'APPROVED_LIBRARY_VERSION'; consent: PrivacyConsent; licence: VariantLicence },
  evidence: PromotionEvidence,
): PromotionGateResult {
  const blockingReasons: string[] = []

  if (candidate.libraryState === 'APPROVED_LIBRARY_VERSION') blockingReasons.push('This variant is already an approved library version; promote a new successor candidate instead.')
  if (!evidence.humanReviewerId || !evidence.humanApprovalId) blockingReasons.push('An identified human reviewer and their explicit approval record are both required — no automated approval path exists.')
  if (!evidence.geometryCheckId) blockingReasons.push('Geometry check is required.')
  if (!evidence.engineeringVerificationId) blockingReasons.push('Engineering verification is required.')
  if (!evidence.licenceReviewId) blockingReasons.push('Licence review is required.')
  if (!evidence.privacyReviewId) blockingReasons.push('Privacy review is required.')
  if (candidate.consent.state !== 'TRAINING_OPT_IN') blockingReasons.push('Explicit TRAINING_OPT_IN consent is required for library contribution; RETRIEVAL_ONLY or NOT_GRANTED are insufficient.')
  if (!evidence.deduplicationCheckPassed) blockingReasons.push('Deduplication check against existing library variants is required.')

  return { allowed: blockingReasons.length === 0, blockingReasons }
}

// ---------------------------------------------------------------------------
// Candidate variant assembly
// ---------------------------------------------------------------------------

export type LibraryState = 'PRIVATE_CANDIDATE' | 'PROMOTION_REVIEW' | 'APPROVED_LIBRARY_VERSION'

export type CandidateVariant = {
  schema: typeof LIBRARY_EVOLUTION_SCHEMA
  variantId: string
  tenantId: string
  lineage: ParentLineage
  intentFacets: IntentFacets
  intentFingerprint: string
  deltas: ParameterDelta[]
  provenance: VariantProvenance
  licence: VariantLicence
  consent: PrivacyConsent
  validationState: ValidationState
  libraryState: LibraryState
}

export type DeriveCandidateVariantInput = {
  tenantId: string
  parentTemplateId: string
  parentTemplateVersion: string
  parentVariant: { variantId: string; lineage: ParentLineage } | null
  parentBaseline: ParentBaselineFacets
  parentLicenceId: string
  parentLicenceReusable: boolean
  copyrightBoundary: string
  intent: IntentFacets
  createdAt: string
  consentGrant: { consentId: string; grantedAt: string; state: PrivacyConsentState } | null
}

/**
 * Derives a private candidate variant from an approved parent shell and a
 * user's stated intent. Entirely deterministic: given the same input this
 * always produces the same fingerprint, deltas and identity — there is no
 * model call, sampling, or hidden state. New candidates always start
 * GENERATED / PRIVATE_CANDIDATE; nothing here advances validation or library
 * state beyond what the caller's evidence and gate checks separately allow.
 */
export function deriveCandidateVariant(input: DeriveCandidateVariantInput): CandidateVariant {
  const lineage = deriveLineage(input.parentTemplateId, input.parentTemplateVersion, input.parentVariant)
  const fingerprint = intentFingerprint(input.intent)
  const deltas = deriveParameterDeltas(input.parentBaseline, input.intent)
  const consent = resolvePrivacyConsent(input.consentGrant)
  const licence = deriveLicence(input.parentLicenceId, input.parentLicenceReusable)

  return {
    schema: LIBRARY_EVOLUTION_SCHEMA,
    variantId: `${input.parentTemplateId}@${input.parentTemplateVersion}:variant:${fingerprint.split(':')[1]}`,
    tenantId: input.tenantId,
    lineage,
    intentFacets: {
      ...input.intent,
      programme: [...input.intent.programme],
      materialPreferences: [...input.intent.materialPreferences],
      openingPreferences: [...input.intent.openingPreferences],
    },
    intentFingerprint: fingerprint,
    deltas,
    provenance: {
      derivedFrom: input.parentVariant ? 'APPROVED_LIBRARY_VARIANT' : 'APPROVED_LIBRARY_TEMPLATE',
      copyrightBoundary: input.copyrightBoundary,
      generationMethod: 'DETERMINISTIC_PARAMETER_DERIVATION',
      createdAt: input.createdAt,
    },
    licence,
    consent,
    validationState: 'GENERATED',
    libraryState: 'PRIVATE_CANDIDATE',
  }
}
