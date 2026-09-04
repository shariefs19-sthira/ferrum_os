// Workspace persistence object model — verbatim from docs/WORKSPACE_SPEC.md
// §1 (operator-supplied). Typed mirror of the doc's data-shape contract:
// what an Artifact IS and how it's stored/versioned/lineage-tracked.
//
// Distinct from apps/web/lib/types.ts (RIVET, W2-401): that file is the
// UI-control-callback contract (WorkspaceProduct/WorkspaceTool enums,
// onProductChange/onToolChange callbacks) for the shell chrome
// components. This file is the persistence/data contract. Both are
// named "Provenance" independently for their own purpose (RIVET's
// WorkspaceProvenance status is "INDICATIVE" | "TEST MODE" | "ROADMAP",
// UI-facing; this one's is "INDICATIVE" | "VERIFIED", the spec's actual
// persisted value) - not reconciled into one type, since they answer
// different questions (what does the UI label say vs. what got saved).

export type UnitsPref = 'm' | 'ft'

export type WorkspaceProject = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  unitsPref: UnitsPref
  primaryAreaUnit: string
}

/**
 * Matches docs/WORKSPACE_SPEC.md §2's artifact-type table exactly — each
 * type there cites the disk row establishing it. Do not add a type here
 * without a corresponding row in that table.
 */
export type ArtifactType =
  | 'PARCEL'
  | 'MASSING'
  | 'PLAN'
  | 'STRUCTURAL'
  | 'BOQ'
  | 'INVEST'
  | 'MARKET'
  | 'PROCURE'

export type ProvenanceStatus = 'INDICATIVE' | 'VERIFIED'

export type Provenance = {
  source: string
  freshness: string
  status: ProvenanceStatus
}

export type Artifact<TInputs = unknown, TOutputs = unknown> = {
  id: string
  projectId: string
  type: ArtifactType
  version: number
  inputs: TInputs
  outputs: TOutputs
  provenance: Provenance
  savedAt: string
  sourceTool: string
  sourceRow: string
  /** Prior artifact ids this one was derived from, oldest first. Empty for a fresh save. */
  lineage: string[]
}

// API surface — docs/WORKSPACE_SPEC.md §"API" verbatim:
//   /api/workspace/projects                    CRUD
//   /api/workspace/projects/:id/artifacts       POST, GET
// Note: this is the NEW project-scoped surface the spec describes.
// /api/workspace/artifacts (the existing, already-shipped W2-327/W2-400
// endpoint — POST/GET/GET-by-id/PATCH/DELETE/export/share, see worker.ts)
// remains the live, working save-to-workspace path used by every
// SaveToWorkspaceButton call site today. The two are not yet unified;
// this type file describes the target object model both should converge
// on, not a claim that the new surface exists yet.
