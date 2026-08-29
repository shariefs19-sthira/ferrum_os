import Link from "next/link"
import Image from "next/image"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <Image
            src="/logo.png"
            alt="Ferrum OS Logo"
            width={120}
            height={120}
            className="mx-auto"
            priority
          />
        </div>
        
        <h1 className="text-9xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Oops! Page not found
        </h2>
        <p className="text-gray-600 mb-8">
          We're sorry, but the page you're looking for seems to have wandered off.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition"
          >
            Go to Home
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            View Products
          </Link>
        </div>
      </div>
    </div>
  )
}