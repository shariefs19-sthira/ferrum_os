"use client"

import { useState } from "react"
import SectionShell from "../../components/sections/SectionShell"
import Eyebrow from "../../components/sections/Eyebrow"
import SectionHeading from "../../components/sections/SectionHeading"
import { PrimaryButton } from "../../components/sections/Buttons"
import AccordionLeaf from "../../components/sections/AccordionLeaf"
import SubscribeButton from "../../components/sections/SubscribeButton"

type Tier = {
  name: string
  price: string
  planId?: string
  featured?: boolean
}

const tiers: Tier[] = [
  { name: "Freemium", price: "Free" },
  { name: "Pro", price: "₹499", planId: "pro", featured: true },
  { name: "Enterprise", price: "₹9,999", planId: "enterprise" },
]

const products = [
  "LandIntel",
  "DesignStudio",
  "Structura",
  "BOQ Pro",
  "ProMarket",
  "BuildOS",
  "ProcureHub",
  "InvestFlow",
  "CommunityBuild",
]

const comparisonFeatures = [
  "Land feasibility",
  "AI design",
  "Structural analysis",
  "BOQ & estimation",
  "Project management",
  "Investment & capital",
]

const faqItems = [
  {
    question: "What's included in the Freemium plan?",
    answer: "The Freemium tier is free to start on, so you can validate a project pipeline before committing to a paid plan.",
  },
  {
    question: "How is Pro pricing structured?",
    answer: "Pro is ₹499 per product, and the same tiers apply across all 9 products — LandIntel, DesignStudio, Structura, BOQ Pro, ProMarket, BuildOS, ProcureHub, InvestFlow, and CommunityBuild.",
  },
  {
    question: "When should I move to Enterprise?",
    answer: "Enterprise is ₹9,999 and fits teams that need coverage across the full product set rather than paying per product.",
  },
  {
    question: "How does this compare to global tools?",
    answer: "At ₹499 per product, pricing runs 60–90% below global construction-tech tools covering the same 9 products.",
  },
]

export default function PricingPage() {
  const [showAllProducts, setShowAllProducts] = useState(false)
  const visibleProducts = showAllProducts ? products : products.slice(0, 3)

  return (
    <main>
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Pricing</Eyebrow>
          <SectionHeading as="h1" className="mt-4">
            Simple, SMB-friendly pricing
          </SectionHeading>
          <div className="mt-8 flex justify-center gap-4">
            <PrimaryButton href="/get-started">Start Free Trial</PrimaryButton>
          </div>
        </div>
      </SectionShell>

      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading>Choose the plan that fits your build</SectionHeading>
          <p className="mt-4 text-xs text-relume-ink opacity-70">
            Subscriptions run in test mode — no real charge occurs while this is under active build.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-lg border p-8 ${tier.featured ? "border-relume-ink" : "border-relume-border"} bg-relume-surface`}
            >
              {tier.featured && (
                <div className="mb-4 inline-flex rounded-full bg-relume-ink px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                  Most popular
                </div>
              )}
              <h3 className="text-lg font-semibold tracking-relume-tight text-relume-ink">{tier.name}</h3>
              <p className="mt-4 text-4xl font-semibold tracking-relume-tight text-relume-ink">{tier.price}</p>
              <div className="mt-8">
                {tier.planId ? (
                  <SubscribeButton
                    planId={tier.planId}
                    label={`Subscribe to ${tier.name} (test mode)`}
                    className={
                      tier.featured
                        ? "inline-flex items-center justify-center rounded-full bg-relume-ink px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                        : "inline-flex items-center justify-center rounded-full border border-relume-border px-6 py-3 text-sm font-medium text-relume-ink transition hover:bg-relume-surface-secondary disabled:opacity-60"
                    }
                  />
                ) : (
                  <PrimaryButton href="/get-started">Start Free Trial</PrimaryButton>
                )}
              </div>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading>Every product, one simple price</SectionHeading>
        </div>
        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-relume-border">
                <th className="py-3 pr-4 font-semibold text-relume-ink">Product</th>
                <th className="py-3 pr-4 font-semibold text-relume-ink">Freemium</th>
                <th className="py-3 pr-4 font-semibold text-relume-ink">Pro</th>
                <th className="py-3 font-semibold text-relume-ink">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map((product) => (
                <tr key={product} className="border-b border-relume-border">
                  <td className="py-3 pr-4 text-relume-ink">{product}</td>
                  <td className="py-3 pr-4 text-relume-ink">Free</td>
                  <td className="py-3 pr-4 text-relume-ink">₹499</td>
                  <td className="py-3 text-relume-ink">₹9,999</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!showAllProducts && (
            <button
              type="button"
              onClick={() => setShowAllProducts(true)}
              className="mt-6 text-sm font-medium text-relume-ink underline underline-offset-4"
            >
              Show all 9 products
            </button>
          )}
        </div>
      </SectionShell>

      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading>Compare what&apos;s included</SectionHeading>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {comparisonFeatures.map((feature) => (
            <div key={feature} className="rounded-lg border border-relume-border bg-relume-surface p-6">
              <p className="text-base font-semibold text-relume-ink">{feature}</p>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading>Pricing that pays for itself</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            60–90% below global construction-tech tools — ₹499 per product, across 9 products.
          </p>
        </div>
      </SectionShell>

      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading>Pricing questions, answered</SectionHeading>
        </div>
        <div className="mx-auto mt-12 max-w-3xl">
          <AccordionLeaf items={faqItems} />
        </div>
      </SectionShell>

      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading>Start building free today</SectionHeading>
          <div className="mt-8 flex justify-center gap-4">
            <PrimaryButton href="/get-started">Start Free Trial</PrimaryButton>
          </div>
        </div>
      </SectionShell>
    </main>
  )
}
