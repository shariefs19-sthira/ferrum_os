import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import SiteShell from "./SiteShell"

let pathname = "/"

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock("./MotionObserver", () => ({ default: () => <span>motion observer</span> }))
vi.mock("./SiteHeader", () => ({ default: () => <header>public header</header> }))
vi.mock("./NewsletterSignup", () => ({ default: () => <section>newsletter</section> }))
vi.mock("./Footer", () => ({ default: () => <footer>public footer</footer> }))
vi.mock("./Concierge", () => ({ default: () => <aside>global sutra</aside> }))

describe("SiteShell", () => {
  beforeEach(() => { pathname = "/" })

  it("renders public furniture around marketing routes", () => {
    render(<SiteShell><main>public page</main></SiteShell>)
    expect(screen.getByText("public header")).toBeTruthy()
    expect(screen.getByText("newsletter")).toBeTruthy()
    expect(screen.getByText("public footer")).toBeTruthy()
    expect(screen.getByText("global sutra")).toBeTruthy()
  })

  it("removes public furniture and duplicate SUTRA from project routes", () => {
    pathname = "/project-workspace/cockpit"
    render(<SiteShell><main>project cockpit</main></SiteShell>)
    expect(screen.getByText("project cockpit")).toBeTruthy()
    expect(screen.queryByText("public header")).toBeNull()
    expect(screen.queryByText("newsletter")).toBeNull()
    expect(screen.queryByText("public footer")).toBeNull()
    expect(screen.queryByText("global sutra")).toBeNull()
  })
})
