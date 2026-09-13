import { beforeEach, describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import WorkspaceCockpit from "./WorkspaceCockpit"

// Space3D pulls in three.js/WebGLRenderer, which has no real canvas
// backing in jsdom - stubbed so this test can focus on what it's
// actually verifying (battery-fail 2: a tool mutate recomputes the
// live-metrics callback), not 3D rendering, which is out of scope here.
vi.mock("./Space3D", () => ({ default: () => <div data-testid="space3d-stub" /> }))

describe("WorkspaceCockpit onLiveMetricsChange (battery-fail 2)", () => {
  beforeEach(() => window.localStorage.clear())

  it("fires once on mount with real derived metrics, not a placeholder", async () => {
    const onLiveMetricsChange = vi.fn()
    render(<WorkspaceCockpit onLiveMetricsChange={onLiveMetricsChange} />)

    await waitFor(() => expect(onLiveMetricsChange).toHaveBeenCalled())
    const firstCall = onLiveMetricsChange.mock.calls[0][0]
    expect(firstCall.extracts.find((e: { label: string }) => e.label === "Floors").value).toBe("3")
    expect(firstCall.provenance.status).toBe("INDICATIVE")
  })

  it("recomputes live when a Parameter slider (tool mutate) changes", async () => {
    const onLiveMetricsChange = vi.fn()
    render(<WorkspaceCockpit onLiveMetricsChange={onLiveMetricsChange} />)
    await waitFor(() => expect(onLiveMetricsChange).toHaveBeenCalledTimes(1))

    // Fine controls (the Parameter sliders) are collapsed by default
    // and opened via a window CustomEvent - landed by another seat
    // after this test was first written. Open it the same way a real
    // trigger elsewhere in the shell would, rather than reaching into
    // component internals.
    fireEvent(window, new CustomEvent("ferrum:workspace-advanced"))

    // Parameters render in a fixed order: plot width, plot depth,
    // setback, floors - the 4th slider is Floors (accessible-name
    // lookup via the wrapping <label>+<output> isn't reliable in jsdom
    // here, so query by the known, stable render order instead).
    const sliders = await waitFor(() => {
      const found = screen.getAllByRole("slider")
      expect(found.length).toBeGreaterThanOrEqual(4)
      return found
    })
    const floorsSlider = sliders[3]
    fireEvent.change(floorsSlider, { target: { value: "5" } })

    await waitFor(() => expect(onLiveMetricsChange).toHaveBeenCalledTimes(2))
    const secondCall = onLiveMetricsChange.mock.calls[1][0]
    expect(secondCall.extracts.find((e: { label: string }) => e.label === "Floors").value).toBe("5")
    // Gross area must actually change with floor count, not be a frozen
    // snapshot from mount - real recompute, not a stale value re-sent.
    const firstArea = onLiveMetricsChange.mock.calls[0][0].areaSquareMetres
    expect(secondCall.areaSquareMetres).not.toBe(firstArea)
  })

  it("clamps command growth and resets to the canonical baseline", async () => {
    const onLiveMetricsChange = vi.fn()
    render(<WorkspaceCockpit onLiveMetricsChange={onLiveMetricsChange} />)
    await waitFor(() => expect(onLiveMetricsChange).toHaveBeenCalled())

    fireEvent(window, new CustomEvent("ferrum:workspace-command", { detail: "set floors 99" }))
    await waitFor(() => expect(onLiveMetricsChange.mock.calls.at(-1)[0].extracts.find((e: { label: string }) => e.label === "Floors").value).toBe("3"))

    fireEvent(window, new CustomEvent("ferrum:workspace-command", { detail: "set floors 1" }))
    await waitFor(() => expect(onLiveMetricsChange.mock.calls.at(-1)[0].extracts.find((e: { label: string }) => e.label === "Floors").value).toBe("1"))
    fireEvent(window, new CustomEvent("ferrum:workspace-command", { detail: "reset model" }))
    await waitFor(() => expect(onLiveMetricsChange.mock.calls.at(-1)[0].extracts.find((e: { label: string }) => e.label === "Floors").value).toBe("3"))
  })

  it("routes BUY diligence to Land and BUILD permissions to Build", async () => {
    const landMetrics = vi.fn()
    const { unmount } = render(<WorkspaceCockpit activeProduct="Land" onLiveMetricsChange={landMetrics} />)
    await waitFor(() => expect(landMetrics).toHaveBeenCalled())
    const landExtracts = landMetrics.mock.calls.at(-1)[0].extracts
    expect(landExtracts.some((item: { label: string }) => item.label.startsWith("BUY ·"))).toBe(true)
    expect(landExtracts.some((item: { label: string }) => item.label.startsWith("BUILD ·"))).toBe(false)
    expect(landMetrics.mock.calls.at(-1)[0].provenance.source).toContain("2026.1-SAMPLE")
    unmount()

    const buildMetrics = vi.fn()
    render(<WorkspaceCockpit activeProduct="Build" onLiveMetricsChange={buildMetrics} />)
    await waitFor(() => expect(buildMetrics).toHaveBeenCalled())
    const buildExtracts = buildMetrics.mock.calls.at(-1)[0].extracts
    expect(buildExtracts.some((item: { label: string }) => item.label.startsWith("BUILD ·"))).toBe(true)
    expect(buildExtracts.some((item: { label: string }) => item.label.startsWith("BUY ·"))).toBe(false)
  })

  it('keeps the canvas full width and exposes the extract as a dismissible overlay in a full-bleed embed', async () => {
    render(<WorkspaceCockpit embedMode="full-bleed" />)
    const cockpit = document.querySelector('[data-workspace-cockpit]')
    const canvas = document.querySelector('[data-cockpit-canvas]')
    expect(cockpit?.getAttribute('data-embed-mode')).toBe('full-bleed')
    expect(canvas?.parentElement?.classList.contains('min-w-0')).toBe(true)
    const toggle = screen.getByRole('button', { name: 'Data extract' })
    expect(document.querySelector('[data-contextual-extract]')?.getAttribute('aria-hidden')).toBe('true')
    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: 'Hide data extract' })).toBeTruthy()
    expect(document.querySelector('[data-contextual-extract]')?.getAttribute('aria-hidden')).toBe('false')
  })
})
