'use client';

import Link from 'next/link';

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Documentation Hub</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our comprehensive guides, articles, and resources to help you get the most out of our platform.
          </p>
        </div>

        {/* Getting Started */}
        <section className="mb-20">
          <h2 className="text-3xl font-semibold text-gray-800 mb-3 text-center">Getting started</h2>
          <p className="text-base text-gray-600 text-center max-w-2xl mx-auto mb-10">
            New to Ferrum OS? Start with one of the three sample pages below — they cover the
            most common questions on standards, project learning, and real-world delivery.
          </p>
          <ol className="max-w-3xl mx-auto space-y-4">
            <li>
              <Link
                href="/resources/is-code-guides"
                className="flex items-start gap-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-5 border border-gray-200"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">1</span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Skim the IS-Code guides</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Five-minute primers on the IS codes (IS 456, IS 1200, IS 800, IS 875, CESMM4) that
                    Ferrum OS applies under the hood.
                  </p>
                  <span className="inline-block mt-2 text-blue-600 text-sm font-medium">Open IS-Code Guides &rarr;</span>
                </div>
              </Link>
            </li>
            <li>
              <Link
                href="/resources/blog"
                className="flex items-start gap-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-5 border border-gray-200"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">2</span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Read the blog</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Short articles on monsoon concreting, ULPIN/ULIN, IS 1200 vs CESMM4, and the
                    advanced ULPIN lookup workflow.
                  </p>
                  <span className="inline-block mt-2 text-blue-600 text-sm font-medium">Open Blog &rarr;</span>
                </div>
              </Link>
            </li>
            <li>
              <Link
                href="/resources/case-studies"
                className="flex items-start gap-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-5 border border-gray-200"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">3</span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Explore case studies</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    How greenfield developers, self-build families, contractors, and infrastructure
                    operators use Ferrum OS in production.
                  </p>
                  <span className="inline-block mt-2 text-blue-600 text-sm font-medium">Open Case Studies &rarr;</span>
                </div>
              </Link>
            </li>
          </ol>
        </section>

        {/* Resource Links */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Link href="/resources/is-code-guides">
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 h-full flex flex-col">
                <div className="flex items-start space-x-4">
                  <span className="text-3xl">📖</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">IS-Code Guides</h3>
                    <p className="text-gray-600 mb-4">Learn how to integrate and use IS-Code.</p>
                    <div className="flex items-center text-blue-600 font-medium">
                      <span>Learn more</span>
                      <span className="ml-1">→</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/resources/blog">
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 h-full flex flex-col">
                <div className="flex items-start space-x-4">
                  <span className="text-3xl">📝</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Blog</h3>
                    <p className="text-gray-600 mb-4">Latest updates, news, and insights.</p>
                    <div className="flex items-center text-blue-600 font-medium">
                      <span>Learn more</span>
                      <span className="ml-1">→</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/resources/case-studies">
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 h-full flex flex-col">
                <div className="flex items-start space-x-4">
                  <span className="text-3xl">📊</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Case Studies</h3>
                    <p className="text-gray-600 mb-4">Real-world examples and success stories.</p>
                    <div className="flex items-center text-blue-600 font-medium">
                      <span>Learn more</span>
                      <span className="ml-1">→</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}