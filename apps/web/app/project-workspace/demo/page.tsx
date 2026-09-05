import Space3DDemo from '../../../components/workspace/Space3DDemo'

export const metadata = {
  title: 'Workspace 3D demo — Ferrum OS',
  description: 'A scripted low-cost presentation of Ferrum OS deterministic massing.',
}

export default function WorkspaceDemoPage() {
  return (
    <main className="min-h-screen bg-relume-surface-secondary p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <Space3DDemo />
      </div>
    </main>
  )
}
