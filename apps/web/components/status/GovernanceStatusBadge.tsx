export type CapabilityState = "AVAILABLE" | "LIMITED PREVIEW" | "TEST MODE" | "ROADMAP" | "UNAVAILABLE IN THIS REGION"
export type EvidenceState = "SOURCE VERIFIED" | "USER PROVIDED" | "INFERRED" | "INDICATIVE" | "UNKNOWN" | "CONFLICT" | "STALE UPSTREAM DATA"
export type ReleaseState = "WORKING" | "CONCEPT FROZEN" | "COORDINATION FROZEN" | "ENGINEERING VERIFIED" | "APPROVED FOR ISSUE" | "FABRICATION RELEASED" | "CONSTRUCTION RELEASED"

type StatusKind = "capability" | "evidence" | "release"
type StatusValue = CapabilityState | EvidenceState | ReleaseState

const toneByValue: Record<StatusValue, string> = {
  AVAILABLE: "border-relume-success text-relume-command",
  "LIMITED PREVIEW": "border-relume-accent text-relume-command",
  "TEST MODE": "border-relume-accent text-relume-command",
  ROADMAP: "border-relume-steel-soft text-relume-muted",
  "UNAVAILABLE IN THIS REGION": "border-relume-steel-soft text-relume-muted",
  "SOURCE VERIFIED": "border-relume-success text-relume-command",
  "USER PROVIDED": "border-relume-steel text-relume-command",
  INFERRED: "border-relume-steel text-relume-command",
  INDICATIVE: "border-relume-accent text-relume-command",
  UNKNOWN: "border-relume-steel-soft text-relume-muted",
  CONFLICT: "border-relume-danger text-relume-danger",
  "STALE UPSTREAM DATA": "border-relume-danger text-relume-danger",
  WORKING: "border-relume-steel text-relume-command",
  "CONCEPT FROZEN": "border-relume-steel text-relume-command",
  "COORDINATION FROZEN": "border-relume-steel text-relume-command",
  "ENGINEERING VERIFIED": "border-relume-success text-relume-command",
  "APPROVED FOR ISSUE": "border-relume-success text-relume-command",
  "FABRICATION RELEASED": "border-relume-success text-relume-command",
  "CONSTRUCTION RELEASED": "border-relume-success text-relume-command",
}

const descriptionByKind: Record<StatusKind, string> = {
  capability: "Capability availability",
  evidence: "Evidence status",
  release: "Project release status",
}

export default function GovernanceStatusBadge({ kind, value }: { kind: StatusKind; value: StatusValue }) {
  return (
    <span
      className={`inline-flex min-h-6 items-center gap-1.5 rounded-full border bg-relume-surface px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.08em] ${toneByValue[value]}`}
      aria-label={`${descriptionByKind[kind]}: ${value}`}
      data-status-kind={kind}
      data-status-value={value}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {value}
    </span>
  )
}

export function CapabilityStatusBadge({ value }: { value: CapabilityState }) {
  return <GovernanceStatusBadge kind="capability" value={value} />
}

export function EvidenceStatusBadge({ value }: { value: EvidenceState }) {
  return <GovernanceStatusBadge kind="evidence" value={value} />
}

export function ReleaseStatusBadge({ value }: { value: ReleaseState }) {
  return <GovernanceStatusBadge kind="release" value={value} />
}
