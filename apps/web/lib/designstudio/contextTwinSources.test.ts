import { describe, expect, it } from "vitest"
import { contextAnalysisEngines, contextTwinSources } from "./contextTwinSources"

describe("DesignStudio context twin source hierarchy", () => {
  it("keeps project survey as the only control source", () => {
    expect(contextTwinSources.filter((source) => source.authority === "CONTROL").map((source) => source.id)).toEqual(["project-survey"])
  })

  it("keeps photorealistic tiles visual-only", () => {
    expect(contextTwinSources.find((source) => source.id === "google-photorealistic")?.authority).toBe("VISUAL-ONLY")
  })

  it("does not represent any analysis engine as automatic approval", () => {
    expect(contextAnalysisEngines.every((engine) => ["CHECK", "SIMULATION", "SPECIALIST-REVIEW"].includes(engine.decisionState))).toBe(true)
  })
})

