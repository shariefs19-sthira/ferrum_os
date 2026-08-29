'use client';

import Link from 'next/link';

export default function DocumentationPage() {
  const resources = [
    {
      title: 'IS-Code Guides',
      description: 'Learn how to integrate and use IS-Code.',
      href: '/resources/is-code-guides',
      icon: '📖',
    },
    {
      title: 'Blog',
      description: 'Latest updates, news, and insights.',
      href: '/resources/blog',
      icon: '📝',
    },
    {
      title: 'Case Studies',
      description: 'Real-world examples and success stories.',
      href: '/resources/case-studies',
      icon: '📊',
    },
  ];

  const placeholders = [
    {
      title: 'Getting Started',
      description: 'Quick start guides and tutorials.',
      icon: '🚀',
    },
    {
      title: 'API Reference',
      description: 'Detailed API documentation.',
      icon: '⚙️',
    },
    {
      title: 'Troubleshooting',
      description: 'Common issues and solutions.',
      icon: '🔧',
    },
  ];

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

        {/* Resource Links */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {resources.map((resource, index) => (
              <Link key={index} href={resource.href}>
                <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 h-full flex flex-col">
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">{resource.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{resource.title}</h3>
                      <p className="text-gray-600 mb-4">{resource.description}</p>
                      <div className="flex items-center text-blue-600 font-medium">
                        <span>Learn more</span>
<<<<<<< HEAD
=======
>>>>>>> origin/w2-17-demo-page
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Placeholder Sections */}
        <section>
          <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Documentation Sections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {placeholders.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 h-full">
                <div className="flex items-start space-x-4">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}