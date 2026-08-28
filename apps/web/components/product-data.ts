import type { RelumeComponent } from '@shared/relume-contracts'; // Use the new alias

// Define the structure for product data
export interface ProductData {
  slug: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  components: RelumeComponent[]; // Use the imported type
}

// --- MOCK DATA FOR PRODUCT PAGES ---
// This data simulates what would come from an API.
// Each product has a slug, name, description, color scheme, and a list of Relume-compatible components.

export const productsData: ProductData[] = [
  {
    slug: "structura",
    name: "Structura",
    description: "Advanced structural analysis and design software.",
    primaryColor: "#1e40af", // blue-800
    secondaryColor: "#3b82f6", // blue-500
    accentColor: "#f59e0b", // amber-500
    components: [
      {
        id: "structura-hero",
        type: "hero",
        props: {
          title: "Structura: Build Stronger",
          description: "Cutting-edge tools for structural engineers.",
          ctaText: "Start Modeling",
          imageSrc: "/placeholder-hero.jpg"
        }
      },
      {
        id: "structura-features",
        type: "features",
        props: {
          features: [
            { title: "3D Modeling", description: "Intuitive 3D modeling tools." },
            { title: "Load Analysis", description: "Sophisticated load analysis." },
            { title: "Code Compliance", description: "Ensures compliance with standards." }
          ]
        }
      },
      {
        id: "structura-pricing",
        type: "pricing",
        props: {
          plans: [
            { name: "Professional", price: "$99/month", features: ["Full Access", "Priority Support"] },
            { name: "Enterprise", price: "Custom", features: ["All Features", "Dedicated Account Manager"] }
          ]
        }
      }
    ]
  },
  {
    slug: "promarket",
    name: "Promarket",
    description: "Comprehensive marketing campaign management platform.",
    primaryColor: "#7e22ce", // violet-700
    secondaryColor: "#a855f7", // violet-500
    accentColor: "#ec4899", // pink-500
    components: [
      {
        id: "promarket-hero",
        type: "hero",
        props: {
          title: "Promarket: Amplify Your Reach",
          description: "Manage and optimize all your campaigns in one place.",
          ctaText: "Launch Campaign",
          imageSrc: "/placeholder-hero.jpg"
        }
      },
      {
        id: "promarket-features",
        type: "features",
        props: {
          features: [
            { title: "Multi-Channel", description: "Manage social, email, search ads." },
            { title: "Analytics", description: "Deep insights into performance." },
            { title: "Automation", description: "Automate routine tasks." }
          ]
        }
      },
      {
        id: "promarket-pricing",
        type: "pricing",
        props: {
          plans: [
            { name: "Growth", price: "$199/month", features: ["Up to 5 campaigns", "Basic Analytics"] },
            { name: "Scale", price: "$499/month", features: ["Unlimited campaigns", "Advanced Analytics", "Dedicated Manager"] }
          ]
        }
      }
    ]
  },
  {
    slug: "buildos",
    name: "BuildOS",
    description: "Operating system for modern construction project management.",
    primaryColor: "#0f766e", // teal-700
    secondaryColor: "#14b8a6", // teal-500
    accentColor: "#f97316", // orange-500
    components: [
      {
        id: "buildos-hero",
        type: "hero",
        props: {
          title: "BuildOS: Manage Smarter",
          description: "Streamline communication and workflows.",
          ctaText: "Start Free Trial",
          imageSrc: "/placeholder-hero.jpg"
        }
      },
      {
        id: "buildos-features",
        type: "features",
        props: {
          features: [
            { title: "Team Coordination", description: "Centralized communication hub." },
            { title: "Document Control", description: "Secure document sharing." },
            { title: "Timeline Tracking", description: "Real-time progress tracking." }
          ]
        }
      },
      {
        id: "buildos-pricing",
        type: "pricing",
        props: {
          plans: [
            { name: "Starter", price: "$299/project", features: ["Up to 10 users", "Basic features"] },
            { name: "Professional", price: "$599/project", features: ["Unlimited users", "Advanced features", "Priority Support"] }
          ]
        }
      }
    ]
  },
  {
    slug: "procurehub",
    name: "ProcureHub",
    description: "Centralized procurement and vendor management system.",
    primaryColor: "#92400e", // amber-900
    secondaryColor: "#f59e0b", // amber-500
    accentColor: "#10b981", // emerald-500
    components: [
      {
        id: "procurehub-hero",
        type: "hero",
        props: {
          title: "ProcureHub: Source Better",
          description: "Optimize spend and manage vendors effectively.",
          ctaText: "Get Started",
          imageSrc: "/placeholder-hero.jpg"
        }
      },
      {
        id: "procurehub-features",
        type: "features",
        props: {
          features: [
            { title: "Vendor Portal", description: "Self-service portal for vendors." },
            { title: "Spend Analysis", description: "Visualize spending patterns." },
            { title: "Contract Management", description: "Lifecycle contract management." }
          ]
        }
      },
      {
        id: "procurehub-pricing",
        type: "pricing",
        props: {
          plans: [
            { name: "Business", price: "$499/month", features: ["Up to 50 vendors", "Standard reports"] },
            { name: "Enterprise", price: "Custom", features: ["Unlimited vendors", "Custom reports", "Dedicated account"] }
          ]
        }
      }
    ]
  },
  {
    slug: "investflow",
    name: "InvestFlow",
    description: "Workflow automation for commercial real estate investments.",
    primaryColor: "#1e3a8a", // blue-900
    secondaryColor: "#3b82f6", // blue-500
    accentColor: "#8b5cf6", // violet-500
    components: [
      {
        id: "investflow-hero",
        type: "hero",
        props: {
          title: "InvestFlow: Invest Faster",
          description: "Accelerate your investment decision pipeline.",
          ctaText: "Demo Today",
          imageSrc: "/placeholder-hero.jpg"
        }
      },
      {
        id: "investflow-features",
        type: "features",
        props: {
          features: [
            { title: "Deal Pipeline", description: "Track deals from sourcing to close." },
            { title: "Financial Modeling", description: "Built-in DCF and LBO models." },
            { title: "Due Diligence", description: "Collaborative DD checklist." }
          ]
        }
      },
      {
        id: "investflow-pricing",
        type: "pricing",
        props: {
          plans: [
            { name: "Core", price: "$999/month", features: ["Up to 10 active deals", "Basic models"] },
            { name: "Premium", price: "$1999/month", features: ["Unlimited deals", "Advanced models", "Personal Analyst"] }
          ]
        }
      }
    ]
  },
  {
    slug: "communitybuild",
    name: "CommunityBuild",
    description: "Platform for affordable housing project collaboration.",
    primaryColor: "#166534", // green-800
    secondaryColor: "#22c55e", // green-500
    accentColor: "#eab308", // yellow-500
    components: [
      {
        id: "communitybuild-hero",
        type: "hero",
        props: {
          title: "CommunityBuild: Build Communities",
          description: "Connect stakeholders for impactful projects.",
          ctaText: "Join a Project",
          imageSrc: "/placeholder-hero.jpg"
        }
      },
      {
        id: "communitybuild-features",
        type: "features",
        props: {
          features: [
            { title: "Stakeholder Network", description: "Connect municipalities, NGOs, builders." },
            { title: "Funding Tracker", description: "Monitor public and private funding." },
            { title: "Progress Reports", description: "Transparent project updates." }
          ]
        }
      },
      {
        id: "communitybuild-pricing",
        type: "pricing",
        props: {
          plans: [
            { name: "Municipality", price: "Free", features: ["Public listings", "Basic reporting"] },
            { name: "Partner", price: "$499/project", features: ["Full collaboration", "Advanced reporting"] }
          ]
        }
      }
    ]
  }
];