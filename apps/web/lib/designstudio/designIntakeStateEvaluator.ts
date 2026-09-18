/**
 * Design-import intake-state evaluator. Reads `designImportCompatRegistry.ts`
 * capability contracts and decides, for one imported file, which approval
 * state it can honestly reach and what happens to downstream artifacts when
 * that file changes.
 *
 * No geometry is actually parsed here — this module only combines declared
 * metadata presence and caller-supplied warning findings against the
 * registry's truthful capability contract for the format.
 */

import {
  getFormatCapability,
  geometryWarningCatalog,
  type DownstreamArtifactKind,
  type GeometryWarningCategoryId,
  type ParserAvailability,
} from './designImportCompatRegistry'

/**
 * PREVIEWED — file recognized and visually/structurally previewable, no
 *   metadata or geometry checks required.
 * VALIDATED — all format-required metadata is present and no BLOCKING
 *   geometry warning remains outstanding.
 * APPROVED_FOR_MACHINE — VALIDATED, plus a verified native geometry parser
 *   actually exists for the format. No format in this registry has one yet,
 *   so this state is currently unreachable fleet-wide; the cap is expressed
 *   here rather than silently allowed, so the gap stays visible.
 */
export type ApprovalState = 'PREVIEWED' | 'VALIDATED' | 'APPROVED_FOR_MACHINE'

const approvalStateOrder: ApprovalState[] = ['PREVIEWED', 'VALIDATED', 'APPROVED_FOR_MACHINE']

function stateIndex(state: ApprovalState): number {
  return approvalStateOrder.indexOf(state)
}

export type IntakeMetadataPresence = {
  hasUnits: boolean
  hasCRS: boolean
  hasDatum: boolean
  hasOrigin: boolean
  hasRevisionId: boolean
}

export type IntakeEvaluationInput = {
  formatId: string
  metadata: IntakeMetadataPresence
  detectedWarnings: GeometryWarningCategoryId[]
}

export type MissingRequirement = {
  field: keyof IntakeMetadataPresence
  reason: string
}

export type IntakeEvaluationResult = {
  formatId: string
  formatRecognized: boolean
  parserAvailability: ParserAvailability | null
  /** Highest state this specific file currently qualifies for, given the checks below. */
  achievedState: ApprovalState
  /** Highest state the format's capability contract could ever certify to, independent of this file's own metadata/warnings. */
  formatCeiling: ApprovalState
  missingRequirements: MissingRequirement[]
  blockingWarnings: GeometryWarningCategoryId[]
  advisoryWarnings: GeometryWarningCategoryId[]
  unsupportedWarnings: GeometryWarningCategoryId[]
  blockedReasons: string[]
}

const metadataFieldByRequirementKey: Record<'units' | 'crs' | 'datum' | 'origin' | 'revision', keyof IntakeMetadataPresence> = {
  units: 'hasUnits',
  crs: 'hasCRS',
  datum: 'hasDatum',
  origin: 'hasOrigin',
  revision: 'hasRevisionId',
}

/** Highest state a format's capability contract could ever certify to, regardless of any one file's metadata. */
function formatCeiling(parserAvailability: ParserAvailability): ApprovalState {
  switch (parserAvailability) {
    // Opaque binary (no decoder) or a closed pointer/document: geometry can
    // never actually be checked, so "no outstanding warning" would only mean
    // "never looked," not "looked and found none." Capped at PREVIEWED.
    case 'METADATA_ONLY':
    case 'REFERENCE_ONLY':
    case 'DOCUMENT_ONLY':
      return 'PREVIEWED'
    // Open/structured formats where metadata presence and caller-supplied
    // geometry-warning findings are meaningful checks, even with no native
    // parser implemented here yet.
    case 'TABULAR_TEXT':
    case 'NO_PARSER_OPEN_TEXT':
    case 'NO_PARSER_OPEN_BINARY':
      // No format in this registry has a verified native geometry parser
      // implemented, so APPROVED_FOR_MACHINE is never reachable today.
      return 'VALIDATED'
    default:
      return 'PREVIEWED'
  }
}

export function evaluateIntakeState(input: IntakeEvaluationInput): IntakeEvaluationResult {
  const format = getFormatCapability(input.formatId)

  if (!format) {
    return {
      formatId: input.formatId,
      formatRecognized: false,
      parserAvailability: null,
      achievedState: 'PREVIEWED',
      formatCeiling: 'PREVIEWED',
      missingRequirements: [],
      blockingWarnings: [],
      advisoryWarnings: [],
      unsupportedWarnings: [],
      blockedReasons: [`Format "${input.formatId}" is not in the design-import compatibility registry.`],
    }
  }

  const ceiling = formatCeiling(format.parserAvailability)

  const missingRequirements: MissingRequirement[] = []
  for (const [key, level] of Object.entries(format.requirements) as [keyof typeof metadataFieldByRequirementKey, string][]) {
    if (level !== 'REQUIRED') continue
    const field = metadataFieldByRequirementKey[key]
    if (!input.metadata[field]) {
      missingRequirements.push({ field, reason: `${format.label} requires ${key} to be declared, but none was supplied with this import.` })
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

  const blockedReasons: string[] = []
  let achievedState: ApprovalState = 'PREVIEWED'

  const canValidate = missingRequirements.length === 0 && blockingWarnings.length === 0
  if (canValidate && stateIndex(ceiling) >= stateIndex('VALIDATED')) {
    achievedState = 'VALIDATED'
  } else {
    if (missingRequirements.length > 0) {
      blockedReasons.push(...missingRequirements.map((m) => m.reason))
    }
    if (blockingWarnings.length > 0) {
      blockedReasons.push(...blockingWarnings.map((w) => `Blocking geometry warning outstanding: ${geometryWarningCatalog[w].label}.`))
    }
  }

  if (achievedState === 'VALIDATED' && stateIndex(ceiling) < stateIndex('APPROVED_FOR_MACHINE')) {
    blockedReasons.push(
      `${format.label} has no verified native geometry parser implemented in this repo (parserAvailability: ${format.parserAvailability}), so APPROVED_FOR_MACHINE cannot be certified.`
    )
  }

  return {
    formatId: format.id,
    formatRecognized: true,
    parserAvailability: format.parserAvailability,
    achievedState,
    formatCeiling: ceiling,
    missingRequirements,
    blockingWarnings,
    advisoryWarnings,
    unsupportedWarnings,
    blockedReasons,
  }
}

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
