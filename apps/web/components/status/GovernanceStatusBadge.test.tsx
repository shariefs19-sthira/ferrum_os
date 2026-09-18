import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CapabilityStatusBadge, EvidenceStatusBadge, ReleaseStatusBadge } from "./GovernanceStatusBadge"

describe("GovernanceStatusBadge", () => {
  it("keeps capability, evidence and release vocabularies distinct", () => {
    render(<><CapabilityStatusBadge value="LIMITED PREVIEW" /><EvidenceStatusBadge value="UNKNOWN" /><ReleaseStatusBadge value="WORKING" /></>)
    expect(screen.getByLabelText("Capability availability: LIMITED PREVIEW")).toBeTruthy()
    expect(screen.getByLabelText("Evidence status: UNKNOWN")).toBeTruthy()
    expect(screen.getByLabelText("Project release status: WORKING")).toBeTruthy()
  })
})
