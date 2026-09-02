import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-relume-surface-secondary px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div
            aria-label="Ferrum OS"
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-relume bg-relume-ink text-3xl font-semibold text-white"
          >
            F
          </div>
        </div>
        
        <h1 className="text-9xl font-semibold tracking-relume-tight text-relume-ink mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-relume-muted mb-2">
          Oops! Page not found
        </h2>
        <p className="text-relume-muted mb-8">
          We're sorry, but the page you're looking for seems to have wandered off.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-relume-ink hover:opacity-90 transition"
          >
            Go to Home
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 border border-relume-border text-base font-medium rounded-md text-relume-muted bg-white hover:bg-relume-surface-secondary transition"
          >
            View Products
          </Link>
        </div>
      </div>
    </div>
  )
}
