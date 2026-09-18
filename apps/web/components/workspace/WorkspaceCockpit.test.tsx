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

  it('retains a clamped opening edit across a browser-local reload and keeps the inspector exclusive with the extract', async () => {
    const first = render(<WorkspaceCockpit embedMode="full-bleed" />)
    fireEvent.click(screen.getByRole('tab', { name: 'Plan' }))
    const marker = await waitFor(() => screen.getAllByRole('button', { name: /select door/i })[0])
    fireEvent.click(marker)
    expect(screen.getByRole('button', { name: 'Close inspector' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Data extract' })).toBeNull()
    const width = screen.getByLabelText('Width (m)')
    fireEvent.change(width, { target: { value: '99' } })
    fireEvent.blur(width)
    expect((await screen.findByRole('alert')).textContent).toMatch(/clamped/i)
    first.unmount()
    render(<WorkspaceCockpit embedMode="full-bleed" />)
    fireEvent.click(screen.getByRole('tab', { name: 'Plan' }))
    const restored = await waitFor(() => screen.getAllByRole('button', { name: /select door/i })[0])
    fireEvent.click(restored)
    expect((screen.getByLabelText('Width (m)') as HTMLInputElement).value).not.toBe('99')
    expect(screen.getByRole('button', { name: 'Close inspector' })).toBeTruthy()
  })

  it('clears opening selection on Space so the contextual extract returns', async () => {
    render(<WorkspaceCockpit embedMode="full-bleed" />)
    fireEvent.click(screen.getByRole('tab', { name: 'Plan' }))
    fireEvent.click(await waitFor(() => screen.getAllByRole('button', { name: /select door/i })[0]))
    expect(screen.getByRole('button', { name: 'Close inspector' })).toBeTruthy()
    fireEvent.click(screen.getByRole('tab', { name: '3D space' }))
    expect(screen.queryByRole('button', { name: 'Close inspector' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Data extract' })).toBeTruthy()
  })

  // CODEX-SENTINEL-20260918-1708-sutra-command-cockpit-output: the real
  // cockpit route (canvasFirst) no longer floats its own Residential/
  // Commercial/Mixed Use panel over the plan -- SUTRA is the input surface
  // for land-use there. The cockpit shows the current selection only as a
  // compact, non-interactive status label.
  it('hides the floating land-use panel in canvasFirst and shows a compact status label instead', async () => {
    const onLiveMetricsChange = vi.fn()
    render(<WorkspaceCockpit canvasFirst onLiveMetricsChange={onLiveMetricsChange} />)
    await waitFor(() => expect(onLiveMetricsChange).toHaveBeenCalled())
    expect(document.querySelector('[data-option-chip-flow]')).toBeNull()
    expect(screen.getByText(/Use: Residential/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Mixed Use' })).toBeNull()
  })

  it('still shows the floating land-use panel for non-canvasFirst marketing/preview embeds (no SUTRA panel present there)', async () => {
    const onLiveMetricsChange = vi.fn()
    render(<WorkspaceCockpit onLiveMetricsChange={onLiveMetricsChange} />)
    await waitFor(() => expect(onLiveMetricsChange).toHaveBeenCalled())
    expect(document.querySelector('[data-option-chip-flow]')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Mixed Use' })).toBeTruthy()
  })

  it('hides Site Constraints while SUTRA overlays the canvas (sutraOccludesCanvas), so it never renders unreachable behind it', async () => {
    const onLiveMetricsChange = vi.fn()
    const { rerender } = render(<WorkspaceCockpit canvasFirst controlProduct="landintel" onLiveMetricsChange={onLiveMetricsChange} />)
    await waitFor(() => expect(onLiveMetricsChange).toHaveBeenCalled())
    expect(screen.getByRole('button', { name: 'Site Constraints' })).toBeTruthy()
    rerender(<WorkspaceCockpit canvasFirst controlProduct="landintel" onLiveMetricsChange={onLiveMetricsChange} sutraOccludesCanvas />)
    expect(screen.queryByRole('button', { name: 'Site Constraints' })).toBeNull()
  })

  it('dispatches cockpit selection context (the channel SutraPanel listens on) when an opening is selected', async () => {
    render(<WorkspaceCockpit canvasFirst />)
    fireEvent.click(screen.getByRole('tab', { name: 'Plan' }))
    const listener = vi.fn()
    window.addEventListener('ferrum:cockpit-selection', listener)
    fireEvent.click(await waitFor(() => screen.getAllByRole('button', { name: /select door/i })[0]))
    expect(listener).toHaveBeenCalledTimes(1)
    const detail = listener.mock.calls[0][0].detail
    expect(detail.targetType).toBe('opening')
    expect(detail.label).toMatch(/^Door /)
    window.removeEventListener('ferrum:cockpit-selection', listener)
  })

  it('reserves a scrollable inspector row below the canvas-first model', async () => {
    render(<WorkspaceCockpit canvasFirst />)
    fireEvent.click(screen.getByRole('tab', { name: 'Plan' }))
    fireEvent.click(await waitFor(() => screen.getAllByRole('button', { name: /select door/i })[0]))
    const inspector = document.querySelector('[data-opening-inspector]') as HTMLElement
    expect(inspector.className).toMatch(/overflow-y-auto/)
    fireEvent.click(screen.getByRole('button', { name: 'Close inspector' }))
    expect(document.querySelector('[data-opening-inspector]')).toBeNull()
  })

  // W2-503: three intentional horizontal-scroll interactions removed
  // from this file — the option-chip flow (now wraps instead of
  // scrolling), the compliance diagram (the SVG scales via its own
  // viewBox instead of scrolling), and the measured-BOQ table (fits its
  // narrow sidebar column without a forced scroll).
  it('has no overflow-x-auto scroll container anywhere in its render', async () => {
    const onLiveMetricsChange = vi.fn()
    render(<WorkspaceCockpit onLiveMetricsChange={onLiveMetricsChange} />)
    await waitFor(() => expect(onLiveMetricsChange).toHaveBeenCalled())

    const optionChipFlow = document.querySelector('[data-option-chip-flow]')
    expect(optionChipFlow).toBeTruthy()
    expect(optionChipFlow?.className).not.toMatch(/overflow-x-auto/)
    expect(optionChipFlow?.className).toMatch(/flex-wrap/)

    fireEvent.click(screen.getByRole('button', { name: 'Explain this building' }))
    const diagram = await waitFor(() => {
      const el = document.querySelector('[data-compliance-diagram]')
      expect(el).toBeTruthy()
      return el as HTMLElement
    })
    expect(diagram.innerHTML).not.toMatch(/overflow-x-auto/)
    expect(diagram.querySelector('svg')?.getAttribute('viewBox')).toBeTruthy()

    expect(document.querySelector('[data-measured-boq] .overflow-x-auto')).toBeNull()
    expect(document.querySelectorAll('.overflow-x-auto').length).toBe(0)
  })
})
