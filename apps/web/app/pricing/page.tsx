import Link from "next/link"

export default function PricingPage() {
  const pricingTiers = [
    {
      name: "Starter",
      price: "$99",
      period: "/month",
      description: "Perfect for individual developers and small projects",
      features: [
        "Up to 5 projects",
        "Basic analytics",
        "Email support",
        "1GB storage",
        "Community access"
      ],
      ctaText: "Get Started",
      ctaLink: "/signup",
      popular: false
    },
    {
      name: "Pro",
      price: "$299",
      period: "/month",
      description: "For growing teams and professional developers",
      features: [
        "Unlimited projects",
        "Advanced analytics",
        "Priority support",
        "10GB storage",
        "Team collaboration",
        "API access",
        "Custom integrations"
      ],
      ctaText: "Start Free Trial",
      ctaLink: "/signup",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with custom needs",
      features: [
        "Everything in Pro",
        "Unlimited storage",
        "24/7 dedicated support",
        "SLA guarantee",
        "Custom onboarding",
        "Advanced security",
        "White-label options",
        "Dedicated account manager"
      ],
      ctaText: "Contact Sales",
      ctaLink: "/contact",
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Choose the right plan for your team. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="mt-16 space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                tier.popular ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-0 transform -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              
              <div className="pt-6">
                <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                <p className="mt-2 text-gray-600">{tier.description}</p>
                <div className="mt-4 flex items-baseline">
                  <p className="text-4xl font-bold text-gray-900">{tier.price}</p>
                  <p className="ml-1 text-gray-500">{tier.period}</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <ul className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href={tier.ctaLink}
                  className={`w-full py-3 px-6 rounded-md text-center font-medium text-white ${
                    tier.popular 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  } transition-colors duration-200`}
                >
                  {tier.ctaText}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600">
            Have questions?{' '}
            <Link href="/contact" className="font-medium text-blue-600 hover:text-blue-500">
              Contact our sales team
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}