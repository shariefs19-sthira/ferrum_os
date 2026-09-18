// CODEX-SENTINEL-20260918-1708-sutra-command-cockpit-output. The channel a
// cockpit direct-manipulation selection uses to reach SUTRA: "Selecting an
// output supplies context to SUTRA." Kept as a tiny window CustomEvent bus
// (same pattern as the existing `ferrum:workspace-command` /
// `ferrum:workspace-advanced` events in WorkspaceCockpit.tsx) rather than a
// new prop-drilled channel, since the cockpit canvas and the SUTRA panel are
// siblings in the shell, not parent/child.

export type CockpitSelectionContext = {
  /** What kind of cockpit output was selected, e.g. "opening". */
  targetType: string
  targetId: string
  /** Human-readable label SUTRA can echo back, e.g. "Door D-12". */
  label: string
  /** Optional extra context, e.g. "Floor 2 · Bedroom 1". */
  detail?: string
}

export const COCKPIT_SELECTION_EVENT = 'ferrum:cockpit-selection'

export function dispatchCockpitSelection(context: CockpitSelectionContext) {
  window.dispatchEvent(new CustomEvent<CockpitSelectionContext>(COCKPIT_SELECTION_EVENT, { detail: context }))
}

export function subscribeCockpitSelection(handler: (context: CockpitSelectionContext) => void) {
  const listener = (event: Event) => handler((event as CustomEvent<CockpitSelectionContext>).detail)
  window.addEventListener(COCKPIT_SELECTION_EVENT, listener)
  return () => window.removeEventListener(COCKPIT_SELECTION_EVENT, listener)
}
