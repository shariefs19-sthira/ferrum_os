import { describe, expect, it } from "vitest"
import { personas, getPersona } from "./personas"
import { workspaceProducts } from "../types"
import { kbDomains } from "../knowledgeBase/types"
import { professionalVocabulary } from "../workspace/vocabulary"

describe("W-59 PERSONA_ENGINE persona configs (CRANE's piece)", () => {
  it("has exactly one config per real WorkspaceProduct - all ten, no more, no fewer", () => {
    const keys = Object.keys(personas).sort()
    expect(keys).toEqual([...workspaceProducts].sort())
  })

  it("every persona's expert title matches the operator's verbatim ten-persona list", () => {
    expect(personas.Land.expertTitle).toBe("Land Due-Diligence Consultant")
    expect(personas.Design.expertTitle).toBe("Chartered Architect")
    expect(personas.Structure.expertTitle).toBe("Structural Engineer (IS 456/1893)")
    expect(personas.Cost.expertTitle).toBe("Quantity Surveyor (BOQ/DSR/GST)")
    expect(personas.Market.expertTitle).toBe("Market Analyst")
    expect(personas.Procure.expertTitle).toBe("Procurement & Contracts Manager")
    expect(personas.Invest.expertTitle).toBe("Investment Analyst")
    expect(personas.Build.expertTitle).toBe("Construction Project Manager")
    expect(personas.Community.expertTitle).toBe("Approvals & Community Liaison")
    expect(personas.Transact.expertTitle).toBe("Property Legal Advisor")
  })

  it("every vocabularySet term is a real term from W-30's already-landed ontology, never invented", () => {
    const realTerms = new Set(Object.keys(professionalVocabulary))
    for (const persona of Object.values(personas)) {
      for (const term of persona.vocabularySet) {
        expect(realTerms.has(term)).toBe(true)
      }
    }
  })

  it("every boundKbModules entry is a real KbDomain, never an invented module name", () => {
    const realDomains = new Set(kbDomains)
    for (const persona of Object.values(personas)) {
      expect(persona.boundKbModules.length).toBeGreaterThan(0)
      for (const domain of persona.boundKbModules) {
        expect(realDomains.has(domain)).toBe(true)
      }
    }
  })

  it("getPersona resolves each product to its own config", () => {
    for (const product of workspaceProducts) {
      expect(getPersona(product).product).toBe(product)
    }
  })
})
