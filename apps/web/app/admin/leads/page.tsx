import AdminLeadsView from '../../../components/admin/AdminLeadsView'

// Internal operator tool, not a marketing page — noindex kept local to
// this page rather than touching robots.ts/sitemap.ts (owned elsewhere).
export const metadata = {
  title: 'Leads — Ferrum OS (internal)',
  robots: { index: false, follow: false },
}

export default function AdminLeadsPage() {
  return <AdminLeadsView />
}
