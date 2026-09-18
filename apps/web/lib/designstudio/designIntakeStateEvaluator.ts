/**
 * Design-import intake-state evaluator. Reads `designImportCompatRegistry.ts`
 * capability contracts and decides, for one imported file, which approval
 * state it can honestly reach and what happens to downstream artifacts when
 * that file changes.
 *
 * Reconciled against the real intake state machine in
 * `apps/web/lib/modelIntake.ts` (types imported, not duplicated or edited) —
 * `ModelIntakeState` and `EvidenceValue<T>` are the same types the live IFC
 * intake path (`apps/web/lib/ifcIntake.ts`, web-ifc 0.0.77) produces.
 *
 * Hard rule, enforced structurally by this module's types and logic, not by
 * convention: a caller cannot reach VALIDATED by asserting plain booleans or
 * supplying an empty warnings list. Every required field must carry
 * `EvidenceValue.status === 'OBSERVED'` (parser-produced) or be named in an
 * explicit human ReviewRecord's `verifiedFields` — a bare `'USER PROVIDED'`
 * declaration (an uploader's own claim, unverified) never counts on its own,
 * matching `ifcIntake.ts`'s own note that a user-declared revision "must be
 * confirmed against the project register." A format with no implemented
 * parser can never leave PREVIEWED, regardless of what evidence a caller
 * claims — the registry's `parserAvailability`, not caller input, decides
 * whether a parse could truthfully have happened at all. This module never
 * returns 'APPROVED FOR MACHINE' — see the comment above `evaluateIntakeState`.
 */

import type { EvidenceValue, ModelIntakeState } from '../modelIntake'
import { machineReleaseChecks } from '../modelIntake'
import {
  getFormatCapability,
  geometryWarningCatalog,
  type DownstreamArtifactKind,
  type GeometryWarningCategoryId,
  type ParserAvailability,
} from './designImportCompatRegistry'

/**
 * The subset of the real `ModelIntakeState` lifecycle this evaluator
 * computes. UPLOADED precedes anything this module is given to evaluate;
 * REJECTED is a reviewer action this module does not model. Re-exported
 * (not redeclared) so a caller comparing against `modelIntake.ts` output is
 * always comparing the same literal strings.
 */
export type ApprovalState = Extract<ModelIntakeState, 'PREVIEWED' | 'VALIDATION REQUIRED' | 'VALIDATED'>

type RequiredFieldKey = 'units' | 'crs' | 'datum' | 'origin' | 'revision'

/**
 * What a real parser (currently only web-ifc, via `ifcIntake.ts`) actually
 * produced for one required field. Plain booleans are deliberately not
 * accepted anywhere in this module's public API — an `EvidenceValue` forces
 * the caller to state *how* a value is known, which is exactly what decides
 * whether it can count toward VALIDATED.
 */
export type IntakeParserEvidence = Record<RequiredFieldKey, EvidenceValue<unknown>>

/**
 * A human reviewer's record, structurally mirroring
 * `ModelIntakeReport['approval']` in `modelIntake.ts`. `verifiedFields`
 * lists fields the reviewer independently confirmed by means outside this
 * parser (e.g. checking CRS against a survey document) — the only way a
 * field the parser itself leaves UNKNOWN can ever count toward VALIDATED.
 * A ReviewRecord with no evidence entries is refused by this module, same
 * as `ifcIntake.ts` starts every fresh parse with `approval.evidence: []`
 * and state `VALIDATION REQUIRED`, never VALIDATED.
 */
export type ReviewRecord = {
  reviewer: string
  reviewedAt: string
  evidence: string[]
  verifiedFields: RequiredFieldKey[]
}

export type IntakeEvaluationInput = {
  formatId: string
  /** Omit entirely when no parse has actually happened yet (file only uploaded/previewed). */
  parserEvidence?: IntakeParserEvidence
  detectedWarnings: GeometryWarningCategoryId[]
  /** Omit when no human review has occurred yet. */
  review?: ReviewRecord
}

export type MissingRequirement = {
  field: RequiredFieldKey
  reason: string
}

export type IntakeEvaluationResult = {
  formatId: string
  formatRecognized: boolean
  parserAvailability: ParserAvailability | null
  /** Highest state this specific file currently qualifies for, given the checks below. Never 'APPROVED FOR MACHINE'. */
  achievedState: ApprovalState
  /** Highest state reachable purely from an implemented parser's own output, with no human review at all. */
  automatedCeiling: ApprovalState
  /** Highest state this format's capability contract could ever certify to, independent of this file's own evidence or review. */
  formatCeiling: ApprovalState
  missingRequirements: MissingRequirement[]
  blockingWarnings: GeometryWarningCategoryId[]
  advisoryWarnings: GeometryWarningCategoryId[]
  unsupportedWarnings: GeometryWarningCategoryId[]
  blockedReasons: string[]
}

const requiredFieldKeys: RequiredFieldKey[] = ['units', 'crs', 'datum', 'origin', 'revision']

/**
 * A format can never automatically progress past PREVIEWED unless this repo
 * actually has a parser wired in for it — today, only IFC. Caller-supplied
 * evidence claiming otherwise (a forged "OBSERVED" status for a format with
 * no implemented parser) is ignored at this gate, before any evidence is
 * even inspected, so it can never influence the result.
 */
function automatedCeilingFor(parserAvailability: ParserAvailability): ApprovalState {
  return parserAvailability === 'IMPLEMENTED_METADATA_PARSER' ? 'VALIDATION REQUIRED' : 'PREVIEWED'
}

/**
 * A human reviewer can only validate a file that was actually parsed —
 * review evidence cannot retroactively manufacture a parse this repo never
 * ran. So the format ceiling with review included is VALIDATED only for a
 * format with an implemented parser; everything else stays capped at
 * PREVIEWED even with a fully-populated ReviewRecord.
 */
function formatCeilingFor(parserAvailability: ParserAvailability): ApprovalState {
  return parserAvailability === 'IMPLEMENTED_METADATA_PARSER' ? 'VALIDATED' : 'PREVIEWED'
}

function isReviewRecordValid(review: ReviewRecord | undefined): review is ReviewRecord {
  return !!review && review.reviewer.trim().length > 0 && review.reviewedAt.trim().length > 0 && review.evidence.length > 0
}

/**
 * A required field counts toward VALIDATED only when the parser itself
 * observed it, or a valid human review explicitly names it as independently
 * verified. `'USER PROVIDED'` (an uploader's own unverified declaration) and
 * `'UNKNOWN'`/`'NOT EVALUATED'` never satisfy this on their own — this is
 * the structural block on "caller-supplied booleans/empty warnings alone."
 */
function isFieldSatisfied(field: RequiredFieldKey, evidence: EvidenceValue<unknown> | undefined, review: ReviewRecord | undefined): boolean {
  if (evidence?.status === 'OBSERVED') return true
  if (review && review.verifiedFields.includes(field)) return true
  return false
}

export function evaluateIntakeState(input: IntakeEvaluationInput): IntakeEvaluationResult {
  const format = getFormatCapability(input.formatId)

  if (!format) {
    return {
      formatId: input.formatId,
      formatRecognized: false,
      parserAvailability: null,
      achievedState: 'PREVIEWED',
      automatedCeiling: 'PREVIEWED',
      formatCeiling: 'PREVIEWED',
      missingRequirements: [],
      blockingWarnings: [],
      advisoryWarnings: [],
      unsupportedWarnings: [],
      blockedReasons: [`Format "${input.formatId}" is not in the design-import compatibility registry.`],
    }
  }

  const automatedCeiling = automatedCeilingFor(format.parserAvailability)
  const formatCeiling = formatCeilingFor(format.parserAvailability)
  const blockedReasons: string[] = []

  if (automatedCeiling === 'PREVIEWED') {
    // No implemented parser for this format: no claimed evidence, review, or
    // warning list — however complete it looks — can move it off PREVIEWED.
    return {
      formatId: format.id,
      formatRecognized: true,
      parserAvailability: format.parserAvailability,
      achievedState: 'PREVIEWED',
      automatedCeiling,
      formatCeiling,
      missingRequirements: [],
      blockingWarnings: [],
      advisoryWarnings: [],
      unsupportedWarnings: [],
      blockedReasons: [
        `${format.label} has no implemented parser in this repo (parserAvailability: ${format.parserAvailability}) — no parse has actually happened, so intake state cannot progress past PREVIEWED regardless of any evidence supplied with this request.`,
      ],
    }
  }

  // From here, format.parserAvailability === 'IMPLEMENTED_METADATA_PARSER' (currently only IFC).
  if (!input.parserEvidence) {
    return {
      formatId: format.id,
      formatRecognized: true,
      parserAvailability: format.parserAvailability,
      achievedState: 'PREVIEWED',
      automatedCeiling,
      formatCeiling,
      missingRequirements: [],
      blockingWarnings: [],
      advisoryWarnings: [],
      unsupportedWarnings: [],
      blockedReasons: [`No parser evidence was supplied for ${format.label} — the file has been previewed but not yet parsed.`],
    }
  }

  const missingRequirements: MissingRequirement[] = []
  for (const field of requiredFieldKeys) {
    if (format.requirements[field] !== 'REQUIRED') continue
    if (!isFieldSatisfied(field, input.parserEvidence[field], input.review)) {
      missingRequirements.push({
        field,
        reason: `${format.label} requires ${field} to be parser-OBSERVED or reviewer-verified; it is currently "${input.parserEvidence[field]?.status ?? 'UNKNOWN'}", which is not sufficient on its own.`,
      })
    }
  }

  const blockingWarnings: GeometryWarningCategoryId[] = []
  const advisoryWarnings: GeometryWarningCategoryId[] = []
  const unsupportedWarnings: GeometryWarningCategoryId[] = []
  for (const warningId of input.detectedWarnings) {
    if (!format.applicableWarnings.includes(warningId)) {
      unsupportedWarnings.push(warningId)
      continue
    }
    if (geometryWarningCatalog[warningId].severity === 'BLOCKING') {
      blockingWarnings.push(warningId)
    } else {
      advisoryWarnings.push(warningId)
    }
  }

  const reviewIsValid = isReviewRecordValid(input.review)
  if (input.review && !reviewIsValid) {
    blockedReasons.push('A review record was supplied but is incomplete (missing reviewer, reviewedAt, or non-empty evidence) — an incomplete review cannot certify VALIDATED, the same as ifcIntake.ts starting every parse with approval.evidence: [].')
  }

  let achievedState: ApprovalState = 'VALIDATION REQUIRED'

  const canValidate = missingRequirements.length === 0 && blockingWarnings.length === 0 && reviewIsValid
  if (canValidate) {
    achievedState = 'VALIDATED'
  } else {
    if (missingRequirements.length > 0) blockedReasons.push(...missingRequirements.map((m) => m.reason))
    if (blockingWarnings.length > 0) blockedReasons.push(...blockingWarnings.map((w) => `Blocking geometry warning outstanding: ${geometryWarningCatalog[w].label}.`))
    if (!reviewIsValid && !input.review) blockedReasons.push(`${format.label} requires a completed human ReviewRecord (reviewer, reviewedAt, non-empty evidence) to reach VALIDATED — parser evidence alone only reaches VALIDATION REQUIRED, matching ifcIntake.ts's current behavior.`)
  }

  return {
    formatId: format.id,
    formatRecognized: true,
    parserAvailability: format.parserAvailability,
    achievedState,
    automatedCeiling,
    formatCeiling,
    missingRequirements,
    blockingWarnings,
    advisoryWarnings,
    unsupportedWarnings,
    blockedReasons,
  }
}

/**
 * 'APPROVED FOR MACHINE' is never returned by `evaluateIntakeState`. Real
 * machine release requires all six checks in `modelIntake.machineReleaseChecks`
 * — including checksum/previous-revision comparison and machine/export
 * compatibility validation — that this evaluator has no way to verify itself.
 * Modeling a path to that state here without actually being able to check
 * those six things would be exactly the "false APPROVED_FOR_MACHINE path"
 * this module exists to avoid; recording the reason as a named export keeps
 * it visible and testable rather than an unstated omission.
 */
export const approvedForMachineUnreachableReason =
  `APPROVED FOR MACHINE is not computed by this evaluator. It requires all of: ${machineReleaseChecks.join('; ')} — none of which this module verifies. Use the model intake approval workflow to record that state once a named authority has actually completed them.`

/**
 * A change that just happened to an already-imported file, in the order most
 * intake pipelines would ever emit them. Every kind cascades to every one of
 * the format's downstream consumers — this repo has no fine-grained
 * dependency graph between a specific geometry change and a specific
 * downstream artifact, so the conservative (and honest) rule is "anything
 * downstream of this import is stale until re-checked," not a partial
 * invalidation this registry cannot actually verify.
 */
export type IntakeChangeKind = 'REVISION_BUMP' | 'APPROVAL_DOWNGRADE' | 'NEW_BLOCKING_WARNING' | 'FILE_REPLACED'

export type StaleImpactResult = {
  formatId: string
  changeKind: IntakeChangeKind
  staleArtifacts: DownstreamArtifactKind[]
  reason: string
}

export function computeStaleImpact(formatId: string, changeKind: IntakeChangeKind): StaleImpactResult {
  const format = getFormatCapability(formatId)
  if (!format || format.downstreamConsumers.length === 0) {
    return {
      formatId,
      changeKind,
      staleArtifacts: [],
      reason: format
        ? `${format.label} has no registered downstream consumers, so no artifact is marked stale.`
        : `Format "${formatId}" is not in the design-import compatibility registry.`,
    }
  }

  const changeLabel: Record<IntakeChangeKind, string> = {
    REVISION_BUMP: 'a new revision of the source file was supplied',
    APPROVAL_DOWNGRADE: 'the import\'s approval state was downgraded',
    NEW_BLOCKING_WARNING: 'a new blocking geometry warning was found on the source file',
    FILE_REPLACED: 'the source file was replaced outright',
  }

  return {
    formatId,
    changeKind,
    staleArtifacts: [...format.downstreamConsumers],
    reason: `Because ${changeLabel[changeKind]} for ${format.label}, every downstream artifact derived from it (${format.downstreamConsumers.join(', ')}) is marked stale pending re-validation — this pipeline has no dependency granularity finer than "derived from this import."`,
  }
}
