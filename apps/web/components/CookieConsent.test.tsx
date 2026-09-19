import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const pathname = vi.hoisted(() => ({ value: "/" }))
vi.mock("next/navigation", () => ({ usePathname: () => pathname.value }))

import CookieConsent, { COOKIE_HEIGHT_VAR } from "./CookieConsent"
import { resetSafeStorageMemory } from "../lib/safeStorage"

describe("CookieConsent with blocked or throwing browser storage (RULE 44)", () => {
  beforeEach(() => { window.localStorage.clear(); resetSafeStorageMemory(); pathname.value = "/" })
  afterEach(() => { vi.restoreAllMocks(); resetSafeStorageMemory(); document.documentElement.style.removeProperty(COOKIE_HEIGHT_VAR) })

  it("renders the bar and dismisses it for the session when window.localStorage throws SecurityError", async () => {
    const original = Object.getOwnPropertyDescriptor(window, "localStorage")!
    Object.defineProperty(window, "localStorage", { configurable: true, get() { throw new DOMException("denied", "SecurityError") } })
    try {
      const view = render(<CookieConsent />)
      await screen.findByRole("dialog", { name: "Cookie consent" })
      expect(() => fireEvent.click(screen.getByRole("button", { name: "Got it" }))).not.toThrow()
      expect(screen.queryByRole("dialog", { name: "Cookie consent" })).toBeNull()
      // Still dismissed for this page session when the component remounts (in-memory consent).
      view.unmount()
      render(<CookieConsent />)
      expect(screen.queryByRole("dialog", { name: "Cookie consent" })).toBeNull()
    } finally { Object.defineProperty(window, "localStorage", original) }
  })

  it("dismisses without throwing when setItem throws QuotaExceededError", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("quota", "QuotaExceededError") })
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null)
    render(<CookieConsent />)
    await screen.findByRole("dialog", { name: "Cookie consent" })
    expect(() => fireEvent.click(screen.getByRole("button", { name: "Got it" }))).not.toThrow()
    expect(screen.queryByRole("dialog", { name: "Cookie consent" })).toBeNull()
    expect(document.documentElement.style.getPropertyValue(COOKIE_HEIGHT_VAR)).toBe("")
  })

  it("survives storage that refuses only the consent key", async () => {
    const original = Storage.prototype.setItem
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key: string, value: string) {
      if (key === "ferrum-cookie-consent") throw new DOMException("quota", "QuotaExceededError")
      return original.call(this, key, value)
    })
    render(<CookieConsent />)
    await screen.findByRole("dialog", { name: "Cookie consent" })
    fireEvent.click(screen.getByRole("button", { name: "Got it" }))
    expect(screen.queryByRole("dialog", { name: "Cookie consent" })).toBeNull()
  })
})

describe("CookieConsent coexistence with the SUTRA launcher", () => {
  beforeEach(() => { window.localStorage.clear(); resetSafeStorageMemory(); pathname.value = "/" })
  afterEach(() => { document.documentElement.style.removeProperty(COOKIE_HEIGHT_VAR) })

  it("is a flush bottom bar below the SUTRA layer (z-50) that never floats over content, with a 44px dismiss target", async () => {
    render(<CookieConsent />)
    const banner = await screen.findByRole("dialog", { name: "Cookie consent" })
    expect(banner.className).toContain("z-[45]")
    expect(banner.className).toContain("inset-x-0")
    expect(banner.className).toContain("bottom-0")
    expect(banner.className).not.toMatch(/(^|\s)(sm:)?(left|bottom)-(3|6)/)
    expect(screen.getByRole("button", { name: "Got it" }).className).toContain("min-h-11")
  })

  it("keeps the same bar (reserved via the published height var) on workspace routes instead of overlaying the shell", async () => {
    pathname.value = "/project-workspace/cockpit"
    render(<CookieConsent />)
    const banner = await screen.findByRole("dialog", { name: "Cookie consent" })
    expect(banner.className).toContain("z-[45]")
    expect(banner.className).toContain("bottom-0")
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

  it("reserves the banner strip in the document and the fixed workspace shell so it never covers controls", () => {
    const css = readFileSync(join(__dirname, "../app/globals.css"), "utf8")
    expect(css).toMatch(/body\s*\{\s*padding-bottom:\s*var\(--cookie-consent-h, 0px\)/)
    expect(css).toMatch(/\.h-dvh-safe\[data-workspace-fullscreen\][^}]*calc\(100dvh - var\(--cookie-consent-h, 0px\)\)/)
  })
})

describe("CookieConsent layout-allotment candidates (screenshot/demo switch, ?cookieVariant=A|B|C)", () => {
  const originalSearch = window.location.search
  beforeEach(() => { window.localStorage.clear(); resetSafeStorageMemory(); pathname.value = "/" })
  afterEach(() => {
    document.documentElement.style.removeProperty(COOKIE_HEIGHT_VAR)
    document.documentElement.removeAttribute("data-cookie-variant")
    window.history.replaceState(null, "", "/" + originalSearch)
  })

  it("defaults to variant D (current behaviour) when no query param is present", async () => {
    render(<CookieConsent />)
    const banner = await screen.findByRole("dialog", { name: "Cookie consent" })
    expect(banner.getAttribute("data-variant")).toBe("D")
    expect(banner.className).toContain("fixed")
  })

  it("variant B renders a true modal: aria-modal, scrim, and Escape does not silently accept", async () => {
    window.history.replaceState(null, "", "/?cookieVariant=B")
    render(<CookieConsent />)
    const banner = await screen.findByRole("dialog", { name: "Cookie consent" })
    expect(banner.getAttribute("aria-modal")).toBe("true")
    fireEvent.keyDown(banner, { key: "Escape" })
    expect(screen.getByRole("dialog", { name: "Cookie consent" })).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Got it" }))
    expect(screen.queryByRole("dialog", { name: "Cookie consent" })).toBeNull()
  })

  it("variant B makes siblings at every level above the modal inert (modal sits inside the app shell) and restores them on dismiss", async () => {
    window.history.replaceState(null, "", "/?cookieVariant=B")
    const { container } = render(
      <div data-app-shell>
        <div data-testid="page-behind"><button>page control</button></div>
        <CookieConsent />
      </div>,
    )
    await screen.findByRole("dialog", { name: "Cookie consent" })
    expect(container.querySelector("[data-testid='page-behind']")!.hasAttribute("inert")).toBe(true)
    fireEvent.click(screen.getByRole("button", { name: "Got it" }))
    expect(container.querySelector("[data-testid='page-behind']")!.hasAttribute("inert")).toBe(false)
  })

  it("variant C renders a compact corner card, not a full-width bar", async () => {
    window.history.replaceState(null, "", "/?cookieVariant=C")
    render(<CookieConsent />)
    const banner = await screen.findByRole("dialog", { name: "Cookie consent" })
    expect(banner.getAttribute("data-variant")).toBe("C")
    expect(banner.className).not.toContain("inset-x-0")
  })

  it("variant A tags <html> for the reserved-band layout while shown and clears it once dismissed", async () => {
    window.history.replaceState(null, "", "/?cookieVariant=A")
    render(<CookieConsent />)
    await screen.findByRole("dialog", { name: "Cookie consent" })
    expect(document.documentElement.getAttribute("data-cookie-variant")).toBe("A")
    fireEvent.click(screen.getByRole("button", { name: "Got it" }))
    expect(document.documentElement.getAttribute("data-cookie-variant")).toBeNull()
  })
})
