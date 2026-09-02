import { Suspense } from "react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-relume-ink"></div>
        <p className="mt-4 text-relume-muted">Loading...</p>
      </div>
    </div>
  )
}