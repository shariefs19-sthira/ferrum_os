export type SutraInputSource = "chip" | "text" | "voice"

export type SutraEvent =
  | { type: "TEXT_MESSAGE"; role: "user"; text: string; source: SutraInputSource }
  | { type: "TOOL_CALL"; tool: "workspace.command"; arguments: { command: string }; source: SutraInputSource }
  | { type: "STATE_DELTA"; path: "guided.selection"; value: { stage: string; label: string } }

export function commandEvents(command: string, source: SutraInputSource): SutraEvent[] {
  return [
    { type: "TEXT_MESSAGE", role: "user", text: command, source },
    { type: "TOOL_CALL", tool: "workspace.command", arguments: { command }, source },
  ]
}

// CODEX-SENTINEL-20260918-1708-sutra-command-cockpit-output. "Reversible
// view-only changes may apply immediately; any project-state change must be
// proposed and explicitly confirmed through SUTRA." This is the one
// classifier both SutraPanel (the input surface) and WorkspaceCockpit's own
// `applyCommand` listener (see its branches) key off, so the two stay in
// sync: every branch there that calls `setParameters`/`setLandUse` matches
// this pattern, and every branch that only changes `view`/opens a panel/
// exports does not.
const PROJECT_STATE_COMMAND_PATTERN = /^set\b|^(add|increase)\b.*\b(floor|storey|level)\b|^reset\b.*\b(model|project|design)\b/i

export function isProjectStateCommand(command: string): boolean {
  return PROJECT_STATE_COMMAND_PATTERN.test(command.trim())
}
