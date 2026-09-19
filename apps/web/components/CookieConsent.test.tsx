import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const pathname = vi.hoisted(() => ({ value: "/" }))
vi.mock("next/navigation", () => ({ usePathname: () => pathname.value }))

import CookieConsent, { COOKIE_HEIGHT_VAR } from "./CookieConsent"

describe("CookieConsent coexistence with the SUTRA launcher", () => {
  beforeEach(() => { window.localStorage.clear(); pathname.value = "/" })
  afterEach(() => { document.documentElement.style.removeProperty(COOKIE_HEIGHT_VAR) })

  it("sits below the SUTRA layer (z-50) on marketing routes and keeps a 44px dismiss target", async () => {
    render(<CookieConsent />)
    const banner = await screen.findByRole("dialog", { name: "Cookie consent" })
    expect(banner.className).toContain("z-[45]")
    expect(banner.className).toContain("sm:left-6")
    expect(screen.getByRole("button", { name: "Got it" }).className).toContain("min-h-11")
  })

  it("renders above the workspace shell (z-70) and sheets (z-80) so it stays dismissible there", async () => {
    pathname.value = "/project-workspace/cockpit"
    render(<CookieConsent />)
    expect((await screen.findByRole("dialog", { name: "Cookie consent" })).className).toContain("z-[90]")
  })

  it("publishes its height for the launcher and clears it once dismissed, persisting consent", async () => {
    render(<CookieConsent />)
    await screen.findByRole("dialog", { name: "Cookie consent" })
    expect(document.documentElement.style.getPropertyValue(COOKIE_HEIGHT_VAR)).toMatch(/px$/)
    fireEvent.click(screen.getByRole("button", { name: "Got it" }))
    expect(screen.queryByRole("dialog", { name: "Cookie consent" })).toBeNull()
    expect(document.documentElement.style.getPropertyValue(COOKIE_HEIGHT_VAR)).toBe("")
    expect(window.localStorage.getItem("ferrum-cookie-consent")).toBe("accepted")
  })

  it("stays hidden for a visitor who already accepted", () => {
    window.localStorage.setItem("ferrum-cookie-consent", "accepted")
    render(<CookieConsent />)
    expect(screen.queryByRole("dialog", { name: "Cookie consent" })).toBeNull()
  })
})
