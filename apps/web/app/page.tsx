import Link from "next/link";
import dynamic from 'next/dynamic';

// Lazy load the ProductCard component
const ProductCard = dynamic(() => import('../components/ProductCard'), { 
  loading: () => (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl bg-gray-200 h-8 w-8 rounded"></span>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-100 text-blue-600 h-6 w-12"></span>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2 h-6 bg-gray-200 rounded w-3/4"></h2>
      <p className="text-gray-600 text-sm h-4 bg-gray-200 rounded w-full"></p>
    </div>
  ),
  ssr: false
});

interface Product {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  href?: string;
  comingSoon: boolean;
}

const products: Product[] = [
  { id: "landintel", name: "LandIntel", code: "P1", description: "Land feasibility & zoning", icon: "", href: "/landintel", comingSoon: false },
  { id: "boq-pro", name: "BOQ Pro", code: "P4", description: "Quantity takeoff & cost estimation", icon: "", href: "/boq-pro", comingSoon: false },
  { id: "designstudio", name: "DesignStudio", code: "P2", description: "AI-generated floor plans", icon: "", comingSoon: true },
  { id: "structura", name: "Structura", code: "P3", description: "Structural analysis & design", icon: "", href: "/structura", comingSoon: false },
  { id: "promarket", name: "ProMarket", code: "P5", description: "Hire verified professionals", icon: "", href: "/promarket", comingSoon: false },
  { id: "buildos", name: "BuildOS", code: "P6", description: "Construction project management", icon: "", href: "/buildos", comingSoon: false },
  { id: "procurehub", name: "ProcureHub", code: "P7", description: "Material procurement", icon: "", href: "/procurehub", comingSoon: false },
  { id: "investflow", name: "InvestFlow", code: "P8", description: "Investment forecasting", icon: "", href: "/investflow", comingSoon: false },
  { id: "communitybuild", name: "CommunityBuild", code: "P9", description: "Fractional development", icon: "", href: "/communitybuild", comingSoon: false },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Ferrum OS - AI-Native Construction Platform
          </h1>
          <p className="mt-4 text-lg text-blue-50 sm:text-xl">
            9 integrated products for the entire construction lifecycle
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}