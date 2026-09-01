import SectionShell from '../../components/sections/SectionShell'
import Eyebrow from '../../components/sections/Eyebrow'
import SectionHeading from '../../components/sections/SectionHeading'
import CardGrid from '../../components/sections/CardGrid'

export const metadata = {
  title: 'Products - Ferrum OS',
  description: 'Nine integrated products for the entire construction lifecycle, from land diligence to delivery and returns.',
}

const products = [
  { title: 'LandIntel', body: 'Land feasibility & ULPIN lookup', href: '/products/landintel' },
  { title: 'DesignStudio', body: 'AI architectural design', href: '/products/designstudio' },
  { title: 'Structura', body: 'Structural analysis & IS compliance', href: '/products/structura' },
  { title: 'BOQ Pro', body: 'Automated BOQ & cost estimation', href: '/products/boq-pro' },
  { title: 'ProMarket', body: 'Verified professionals marketplace', href: '/products/promarket' },
  { title: 'BuildOS', body: 'Project management & digital PMC', href: '/products/buildos' },
  { title: 'ProcureHub', body: 'Material procurement & suppliers', href: '/products/procurehub' },
  { title: 'InvestFlow', body: 'Investment forecasting', href: '/products/investflow' },
  { title: 'CommunityBuild', body: 'Fractional development', href: '/products/communitybuild' },
]

export default function ProductsPage() {
  return (
    <main>
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Explore the products</Eyebrow>
          <SectionHeading as="h1" className="mt-4">Nine products. One platform.</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Each product works standalone or plugs into the full workflow — so you can start
            with one and grow into the rest.
          </p>
        </div>
        <div className="mt-12">
          <CardGrid items={products.map((p) => ({ ...p, linkLabel: 'Learn more' }))} columns={3} />
        </div>
      </SectionShell>
    </main>
  )
}
