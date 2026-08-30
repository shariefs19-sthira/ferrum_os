"use client"

import { useState } from "react"

type Plan = {
  name: string
  price: string
  description: string
  features: string[]
  featured?: boolean
}

const plans: Record<"monthly" | "annual", Plan[]> = {
  monthly: [
    { name: "Starter", price: "$29", description: "For early teams validating a single project pipeline.", features: ["Up to 3 active projects", "AI site summary", "Shared document hub"] },
    { name: "Growth", price: "$79", description: "For operators managing multiple active jobs and vendors.", features: ["Unlimited projects", "Live cost tracking", "Procurement workflows"], featured: true },
    { name: "Scale", price: "$149", description: "For enterprise portfolios with multi-entity oversight.", features: ["Advanced forecasting", "Portfolio dashboards", "Dedicated onboarding"] },
  ],
  annual: [
    { name: "Starter", price: "$24", description: "For early teams validating a single project pipeline.", features: ["Up to 3 active projects", "AI site summary", "Shared document hub"] },
    { name: "Growth", price: "$66", description: "For operators managing multiple active jobs and vendors.", features: ["Unlimited projects", "Live cost tracking", "Procurement workflows"], featured: true },
    { name: "Scale", price: "$124", description: "For enterprise portfolios with multi-entity oversight.", features: ["Advanced forecasting", "Portfolio dashboards", "Dedicated onboarding"] },
  ],
}

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly")
  const activePlans = plans[billing]

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">Pricing</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Choose the plan that fits your next phase.
          </h1>
        </div>

        <div className="mb-12 flex items-center justify-center">
          <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
            {(["monthly", "annual"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setBilling(option)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${billing === option ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}
              >
                {option === "monthly" ? "Monthly" : "Annual"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {activePlans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border p-8 shadow-sm ${plan.featured ? "border-blue-200 bg-blue-50/40" : "border-slate-200 bg-white"}`}
            >
              {plan.featured && (
                <div className="mb-4 inline-flex rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                  Most popular
                </div>
              )}

              <h2 className="text-2xl font-bold text-slate-900">{plan.name}</h2>
              <p className="mt-3 text-sm text-slate-600">{plan.description}</p>

              <div className="mt-8 flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tight text-slate-900">{plan.price}</span>
                <span className="text-sm text-slate-500">/seat</span>
              </div>

              <ul className="mt-8 space-y-3 text-sm text-slate-700">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`mt-8 w-full rounded-full px-5 py-3 text-sm font-semibold transition ${plan.featured ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-900 text-white hover:bg-slate-800"}`}
              >
                {plan.featured ? "Start free trial" : "Get started"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
