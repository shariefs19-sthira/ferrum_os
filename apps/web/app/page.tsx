import Link from "next/link";
import dynamic from 'next/dynamic';

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

const productMenu = products.map((product) => ({
  name: product.name,
  href: product.href || '#',
}));

const resourceMenu = [
  { name: 'Blog', href: '#' },
  { name: 'Case Studies', href: '#' },
  { name: 'IS Code Guides', href: '#' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
            Ferrum OS
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <details className="group relative">
              <summary className="cursor-pointer list-none text-sm font-medium text-slate-700 transition group-open:text-slate-900">
                Products
              </summary>
              <div className="absolute left-0 top-full z-10 mt-3 min-w-[220px] rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                {productMenu.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </details>

            <details className="group relative">
              <summary className="cursor-pointer list-none text-sm font-medium text-slate-700 transition group-open:text-slate-900">
                Resources
              </summary>
              <div className="absolute left-0 top-full z-10 mt-3 min-w-[200px] rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                {resourceMenu.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </details>

            <Link href="#" className="text-sm font-medium text-slate-700 transition hover:text-slate-900">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="#" className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 sm:inline-flex">
              Book a demo
            </Link>
            <Link href="#" className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              THE COMPLETE BUILD PLATFORM
            </span>
            <h1 className="mt-6 max-w-xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              India&apos;s first end-to-end construction &amp; investment platform
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Ferrum OS brings capital, design, procurement, compliance, and execution into one operating system for modern builders.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="#" className="inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
                Get started
              </Link>
              <Link href="#" className="inline-flex rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
                Talk to sales
              </Link>
            </div>

            <ul className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
              {[
                'AI underwriting & land intelligence',
                'Live project controls & procurement',
                'Verified contractor and investor network',
                'Built for India-specific compliance and workflow execution',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-blue-600" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Platform overview</p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Build faster with one OS</h2>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Live</span>
              </div>
              <div className="mt-6 space-y-4">
                {[
                  ['LandIntel', 'Site analysis & zoning'],
                  ['BOQ Pro', 'Takeoff & estimating'],
                  ['BuildOS', 'Execution visibility'],
                ].map(([title, subtitle]) => (
                  <div key={title} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div>
                      <p className="font-semibold text-slate-900">{title}</p>
                      <p className="text-sm text-slate-600">{subtitle}</p>
                    </div>
                    <span className="text-sm font-medium text-blue-700">Open</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Solutions</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">The full stack for modern construction</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}