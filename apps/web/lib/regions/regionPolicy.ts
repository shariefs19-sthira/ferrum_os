export type JurisdictionReadiness = "AVAILABLE" | "PARTIAL" | "GLOBAL-CORE"

export type UserRegionProfile = {
  countryCode: string
  label: string
  locale: string
  currency: string
  jurisdictionPack: string
  readiness: JurisdictionReadiness
  enabledExperience: string[]
  heldExperience: string[]
}

const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK",
])

const globalFeatures = [
  "Project workspace",
  "DesignStudio modelling and visualization",
  "IFC/openBIM intake and export",
  "Evidence and revision controls",
  "SUTRA product guidance",
]

const jurisdictionHeld = [
  "Authority-verified planning approval",
  "Local code-compliance conclusion",
  "Local permit submission",
]

/**
 * Coarse user location personalizes discovery only. Project rules are always
 * selected from the project's own recorded jurisdiction, never the user's IP.
 */
export function resolveUserRegion(countryCode?: string | null): UserRegionProfile {
  const code = (countryCode || "XX").trim().toUpperCase()
  if (code === "IN") {
    return {
      countryCode: code,
      label: "India",
      locale: "en-IN",
      currency: "INR",
      jurisdictionPack: "india",
      readiness: "AVAILABLE",
      enabledExperience: [...globalFeatures, "India parcel and standards guidance", "BEE Eco Niwas Samhita checks"],
      heldExperience: jurisdictionHeld,
    }
  }
  if (code === "US") {
    return {
      countryCode: code,
      label: "United States",
      locale: "en-US",
      currency: "USD",
      jurisdictionPack: "united-states",
      readiness: "PARTIAL",
      enabledExperience: globalFeatures,
      heldExperience: [...jurisdictionHeld, "State/county/city rule-pack conclusions"],
    }
  }
  if (EU_COUNTRIES.has(code)) {
    return {
      countryCode: code,
      label: "European region",
      locale: "en",
      currency: "EUR",
      jurisdictionPack: "european-union",
      readiness: "PARTIAL",
      enabledExperience: globalFeatures,
      heldExperience: [...jurisdictionHeld, "Member-state and municipal rule-pack conclusions"],
    }
  }
  return {
    countryCode: code,
    label: code === "XX" ? "Location unresolved" : code,
    locale: "en",
    currency: "USD",
    jurisdictionPack: "global-openbim",
    readiness: "GLOBAL-CORE",
    enabledExperience: globalFeatures,
    heldExperience: [...jurisdictionHeld, "Country-specific jurisdiction conclusions"],
  }
}

export const regionPolicyRule = "User location personalizes discovery; project location governs design and compliance."

