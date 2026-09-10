import { describe, expect, it } from "vitest"
import { createLiveEmbeds } from "./liveEmbed"

const input = { parcel: null, parameters: { plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 3 }, cashFlows: [-100, 40, 45, 50], discountRate: 0.1 }

describe("W-121 live embed payloads", () => {
  it("emits one engine-derived payload for every journey step", () => {
    const embeds = createLiveEmbeds(input)
    expect(embeds.map(embed => embed.step)).toEqual(["land", "design", "estimate", "build", "invest"])
    expect(embeds.find(embed => embed.step === "estimate")?.lines).toHaveLength(4)
    expect(embeds.find(embed => embed.step === "design")?.roomCount).toBe(15)
  })

  it("uses an honest gap when parcel context is absent", () => {
    const land = createLiveEmbeds(input)[0]
    expect(land.status).toBe("GAP")
    expect(land.caption).toBe("No parcel context attached")
  })

  it("computes rather than hardcodes the investment sparkline", () => {
    const invest = createLiveEmbeds(input)[4]
    expect(invest.step === "invest" && invest.sparkline).toEqual([-100, -60, -15, 35])
  })
})
