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
