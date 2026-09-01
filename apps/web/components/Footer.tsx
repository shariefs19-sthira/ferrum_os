import Link from 'next/link'

const products = [
  { name: 'LandIntel', href: '/products/landintel' },
  { name: 'BOQ Pro', href: '/products/boq-pro' },
  { name: 'DesignStudio', href: '/products/designstudio' },
  { name: 'Structura', href: '/products/structura' },
  { name: 'ProMarket', href: '/products/promarket' },
  { name: 'BuildOS', href: '/products/buildos' },
  { name: 'ProcureHub', href: '/products/procurehub' },
  { name: 'InvestFlow', href: '/products/investflow' },
  { name: 'CommunityBuild', href: '/products/communitybuild' },
  { name: 'Transact', href: '/products/transact' }
]

const resources = [
  { name: 'Blog', href: '/resources/blog' },
  { name: 'Case Studies', href: '/resources/case-studies' },
  { name: 'IS Code Guides', href: '/resources/is-code-guides' }
]

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">F</div>
              <span className="text-lg font-semibold text-slate-900">Ferrum OS</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              End-to-end tools for the construction lifecycle, from land intelligence to project delivery.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Products</h3>
              <ul className="mt-4 space-y-3">
                {products.map((product) => (
                  <li key={product.name}>
                    <Link href={product.href} className="text-sm text-slate-600 transition hover:text-slate-900">
                      {product.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Resources</h3>
              <ul className="mt-4 space-y-3">
                {resources.map((resource) => (
                  <li key={resource.name}>
                    <Link href={resource.href} className="text-sm text-slate-600 transition hover:text-slate-900">
                      {resource.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-500">
          © {new Date().getFullYear()} Ferrum OS. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
