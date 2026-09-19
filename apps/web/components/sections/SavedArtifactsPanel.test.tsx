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

// W-11: the signed-out branch was a one-line box and the pending branch
// returned null (blank region). These pin the structured empty state, the
// never-blank pending state, and that the signed-in list is unchanged.
describe("SavedArtifactsPanel signed-out / pending / signed-in states (W-11)", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("renders a skeleton (never blank) while the session request is pending", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>(() => {})))
    const { container } = render(<SavedArtifactsPanel />)
    expect(container.firstChild).not.toBeNull()
    expect(screen.getByTestId("saved-artifacts-pending").getAttribute("aria-busy")).toBe("true")
    expect(screen.queryByText(/open a sample project/i)).toBeNull()
  })

  it("signed out: shows a PREVIEW sample row with disabled Export/Share, a primary CTA and a Sign in link", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url === "/api/auth/session") return new Response(JSON.stringify({ user: null }), { status: 200 })
        throw new Error(`unexpected fetch: ${url}`)
      }),
    )
    render(<SavedArtifactsPanel />)

    const row = await screen.findByTestId("saved-artifacts-preview-row")
    expect(row.textContent).toMatch(/preview/i)
    expect(row.textContent).toMatch(/sample rate estimate/i)
    expect(row.textContent).toMatch(/rate-estimate/)
    expect(row.textContent).toMatch(/19 Sep 2026/)
    const exportBtn = screen.getByRole("button", { name: "Export" }) as HTMLButtonElement
    const shareBtn = screen.getByRole("button", { name: "Share" }) as HTMLButtonElement
    expect(exportBtn.disabled).toBe(true)
    expect(shareBtn.disabled).toBe(true)

    const cta = screen.getByRole("link", { name: /open a sample project/i })
    expect(cta.getAttribute("href")).toBe("/project-workspace/cockpit")
    const signIn = screen.getByRole("link", { name: "Sign in" })
    expect(signIn.getAttribute("href")).toBe("/login")
    // Touch-target class (min-h-11 = 44px) and DOM/tab order: CTA before Sign in.
    expect(cta.className).toMatch(/min-h-11/)
    expect(signIn.className).toMatch(/min-h-11/)
    expect(cta.compareDocumentPosition(signIn) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("signed out: the preview row never calls the artifacts API", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url === "/api/auth/session") return new Response(JSON.stringify({ user: null }), { status: 200 })
      throw new Error(`unexpected fetch: ${url}`)
    })
    vi.stubGlobal("fetch", fetchMock)
    render(<SavedArtifactsPanel />)
    await screen.findByTestId("saved-artifacts-preview-row")
    expect(fetchMock.mock.calls.map((c) => c[0])).toEqual(["/api/auth/session"])
  })

  it("falls back to the signed-out empty state when the session request fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline") }))
    render(<SavedArtifactsPanel />)
    expect(await screen.findByTestId("saved-artifacts-preview-row")).toBeTruthy()
  })

  it("signed in: renders the real list exactly as before, with no preview row or CTA", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url === "/api/auth/session") return new Response(JSON.stringify({ user: { id: "u1" } }), { status: 200 })
        if (url === "/api/workspace/artifacts") {
          return new Response(
            JSON.stringify({ artifacts: [{ id: "a1", type: "note", title: "Real artifact", created_at: "2026-09-04T00:00:00Z" }] }),
            { status: 200 },
          )
        }
        if (url === "/api/projects") return new Response(JSON.stringify({ projects: [] }), { status: 200 })
        throw new Error(`unexpected fetch: ${url}`)
      }),
    )
    render(<SavedArtifactsPanel />)

    await waitFor(() => expect(screen.getByText("Real artifact")).toBeTruthy())
    expect(screen.getByText("Your saved artifacts")).toBeTruthy()
    expect(screen.getByRole("link", { name: "Export" }).getAttribute("href")).toBe("/api/workspace/artifacts/a1/export")
    expect(screen.getByRole("button", { name: "Share" })).toBeTruthy()
    expect(screen.queryByTestId("saved-artifacts-preview-row")).toBeNull()
    expect(screen.queryByText(/open a sample project/i)).toBeNull()
    expect(screen.getByRole("button", { name: "Rename" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy()
  })
})
