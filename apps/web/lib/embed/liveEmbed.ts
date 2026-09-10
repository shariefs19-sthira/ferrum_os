import { computeNpv, estimateIrr } from "../finance/irrNpv"
import { generateStudioPlan } from "../plan-gen"
import type { StudioParameters } from "../types"
import type { ParcelContext } from "../workspace/parcelContext"
import { measureBoq } from "../workspace/measuredBoq"

export type JourneyStep = "land" | "design" | "estimate" | "build" | "invest"
export type LiveEmbedStatus = "VERIFIED" | "INDICATIVE" | "GAP"

type EmbedBase = { step: JourneyStep; href: string; status: LiveEmbedStatus; caption: string }
export type LandLiveEmbed = EmbedBase & { step: "land"; center: ParcelContext["coordinates"]; chips: string[] }
export type DesignLiveEmbed = EmbedBase & { step: "design"; previewProduct: "designstudio"; parameters: StudioParameters; roomCount: number }
export type EstimateLiveEmbed = EmbedBase & { step: "estimate"; lines: Array<{ code: string; label: string; quantity: number; unit: string }> }
export type BuildLiveEmbed = EmbedBase & { step: "build"; phases: Array<{ id: string; label: string; plannedQuantity: number; unit: string }> }
export type InvestLiveEmbed = EmbedBase & { step: "invest"; irr: number | null; npv: number; sparkline: number[] }
export type LiveEmbed = LandLiveEmbed | DesignLiveEmbed | EstimateLiveEmbed | BuildLiveEmbed | InvestLiveEmbed

export type LiveEmbedInput = {
  parcel: ParcelContext | null
  parameters: StudioParameters
  cashFlows: number[]
  discountRate: number
}

const cumulative = (values: number[]) => values.reduce<number[]>((points, value) => [...points, value + (points.at(-1) ?? 0)], [])

/**
 * Produces the five W-121 journey payloads from the same deterministic engines
 * used by the product surfaces. It contains no presentation markup, allowing
 * RIVET's hero to remain the sole responsive/UI implementation.
 */
export function createLiveEmbeds(input: LiveEmbedInput): LiveEmbed[] {
  const plan = generateStudioPlan(input.parameters)
  const boq = measureBoq(plan)
  const landStatus: LiveEmbedStatus = input.parcel?.provenance.status ?? "GAP"

  return [
    {
      step: "land",
      href: "/products/landintel",
      status: landStatus,
      caption: input.parcel ? `${input.parcel.provenance.source} · ${input.parcel.provenance.vintage}` : "No parcel context attached",
      center: input.parcel?.coordinates ?? null,
      chips: input.parcel ? [input.parcel.ulpin ? `ULPIN ${input.parcel.ulpin}` : "ULPIN unavailable", input.parcel.land_use, `${input.parcel.area_sqm.toLocaleString("en-IN")} m²`] : ["Attach a verified LandIntel result"],
    },
    {
      step: "design",
      href: "/products/designstudio",
      status: "INDICATIVE",
      caption: "Deterministic PLAN_GEN preview · verify site and authority constraints",
      previewProduct: "designstudio",
      parameters: input.parameters,
      roomCount: plan.rooms.length,
    },
    {
      step: "estimate",
      href: "/products/boq-pro",
      status: "INDICATIVE",
      caption: "Measured quantities from the current PLAN_GEN model · rates not attached",
      lines: boq.slice(0, 4).map(line => ({ code: line.item.itemCode, label: line.item.name, quantity: line.quantity, unit: line.unit })),
    },
    {
      step: "build",
      href: "/products/buildos",
      status: "INDICATIVE",
      caption: "Planned sequence quantities, not reported site progress",
      phases: [
        { id: "substructure", label: "Substructure", plannedQuantity: boq[0].quantity + boq[1].quantity, unit: "m³" },
        { id: "structure", label: "RCC structure", plannedQuantity: boq[2].quantity, unit: "m³" },
        { id: "envelope", label: "Envelope", plannedQuantity: boq[4].quantity, unit: "m²" },
        { id: "finishes", label: "Finishes", plannedQuantity: boq[6].quantity, unit: "m²" },
      ],
    },
    {
      step: "invest",
      href: "/products/investflow",
      status: "INDICATIVE",
      caption: "Sample cash-flow calculation · not investment advice",
      irr: estimateIrr(input.cashFlows),
      npv: computeNpv(input.cashFlows, input.discountRate),
      sparkline: cumulative(input.cashFlows),
    },
  ]
}
