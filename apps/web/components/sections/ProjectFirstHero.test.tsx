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
})
