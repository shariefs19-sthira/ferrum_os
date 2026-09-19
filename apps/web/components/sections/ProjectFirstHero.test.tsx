import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import ProjectFirstHero from "./ProjectFirstHero"

describe("ProjectFirstHero", () => {
  it("orients users around one project and three truthful starting paths", () => {
    render(<ProjectFirstHero />)
    expect(screen.getByRole("heading", { level: 1, name: /move one building project/i })).toBeTruthy()
    expect(screen.getByRole("link", { name: "Start a project" }).getAttribute("href")).toBe("/project-workspace")
    expect(screen.getByText("I have land")).toBeTruthy()
    expect(screen.getByText("I have a brief")).toBeTruthy()
    expect(screen.getByText("I have drawings or a model")).toBeTruthy()
    expect(screen.getByLabelText("Capability availability: ROADMAP")).toBeTruthy()
  })

  // jsdom has no layout, so this pins the class contract; the rendered
  // hit-test proof is scripts/home-cookie-hero-audit.mjs (docs/evidence/home-cookie-hero).
  it("keeps the CTA row above the fixed cookie strip on short viewports", () => {
    const { container } = render(<ProjectFirstHero />)
    const section = container.querySelector("[data-project-first-hero]") as HTMLElement
    const grid = section.firstElementChild as HTMLElement
    // Top-aligned columns: centring the copy against the tall aside pushed the CTAs ~250px down at 1024-1440.
    expect(grid.className).toContain("lg:items-start")
    expect(grid.className).not.toContain("lg:items-center")
    // Height-aware compaction (no reserved gap: it is media-query driven, so nothing lingers after dismissal).
    expect(section.className).toContain("[@media(max-height:820px)]:lg:py-12")
    expect(section.className).toContain("[@media(max-height:600px)]:py-6")
    const cta = screen.getByRole("link", { name: "Start a project" }).parentElement as HTMLElement
    expect(cta.className).toContain("[@media(max-height:600px)]:mt-4")
  })
})
