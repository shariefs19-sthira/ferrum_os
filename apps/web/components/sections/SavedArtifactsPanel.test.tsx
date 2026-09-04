import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import SavedArtifactsPanel from "./SavedArtifactsPanel"
import SaveToWorkspaceButton from "../SaveToWorkspaceButton"

// Battery-fail (1): after Save, the artifact appears in the UI list
// without a reload. SaveToWorkspaceButton and SavedArtifactsPanel had
// no shared state - they only coordinate via the ARTIFACT_SAVED_EVENT
// window CustomEvent added for this fix. Mounts both real components
// together (as they'd sit on the same page) and drives a real save
// through SaveToWorkspaceButton's own click handler, not a simulated
// event dispatch - exercises the actual wiring, not just the event bus.
describe("Save -> saved-artifacts list, no reload (battery-fail 1)", () => {
  const artifactsBefore = { artifacts: [] }
  const artifactsAfter = { artifacts: [{ id: "a1", type: "note", title: "New artifact", created_at: "2026-09-04T00:00:00Z" }] }

  beforeEach(() => {
    let saved = false
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url === "/api/auth/session") {
          return new Response(JSON.stringify({ user: { id: "u1" } }), { status: 200 })
        }
        if (url === "/api/workspace/artifacts" && init?.method === "POST") {
          saved = true
          return new Response(JSON.stringify({ id: "a1" }), { status: 200 })
        }
        if (url === "/api/workspace/artifacts") {
          return new Response(JSON.stringify(saved ? artifactsAfter : artifactsBefore), { status: 200 })
        }
        if (url === "/api/projects") {
          return new Response(JSON.stringify({ projects: [] }), { status: 200 })
        }
        throw new Error(`unexpected fetch: ${url}`)
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("shows the new artifact in the list after Save, without a page reload", async () => {
    render(
      <>
        <SaveToWorkspaceButton type="note" title="New artifact" data={{ x: 1 }} />
        <SavedArtifactsPanel />
      </>,
    )

    await waitFor(() => expect(screen.getByText(/nothing saved yet/i)).toBeTruthy())

    fireEvent.click(screen.getByRole("button", { name: /save to workspace/i }))

    await waitFor(() => expect(screen.getByText("New artifact")).toBeTruthy())
  })
})
