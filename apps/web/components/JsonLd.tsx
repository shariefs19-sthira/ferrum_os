const products = [
  {
    name: 'LandIntel',
    description: 'AI-assisted land intelligence and feasibility tools for faster parcel evaluation.',
    category: 'Land acquisition and feasibility'
  },
  {
    name: 'BOQ Pro',
    description: 'Takeoff and cost estimation workflows for precise quantity and budget planning.',
    category: 'Quantity surveying and cost planning'
  },
  {
    name: 'DesignStudio',
    description: 'AI-assisted design and concept generation for early project planning.',
    category: 'Design and concept development'
  },
  {
    name: 'Structura',
    description: 'Structural analysis and design support for stronger engineering decisions.',
    category: 'Structural engineering'
  },
  {
    name: 'ProMarket',
    description: 'Verified professional marketplace for hiring trusted specialists and partners.',
    category: 'Professional marketplace'
  },
  {
    name: 'BuildOS',
    description: 'Project execution and collaboration workflows for construction teams.',
    category: 'Construction project management'
  },
  {
    name: 'ProcureHub',
    description: 'Procurement workflows for vendor management, sourcing, and purchase coordination.',
    category: 'Procurement and sourcing'
  },
  {
    name: 'InvestFlow',
    description: 'Investment forecasting and scenario planning for development and project finance.',
    category: 'Investment analysis'
  },
  {
    name: 'CommunityBuild',
    description: 'Community-led project coordination and neighborhood development workflows.',
    category: 'Community and development coordination'
  }
];

export default function JsonLd() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Ferrum OS',
    url: 'https://www.ferrumos.com',
    logo: 'https://www.ferrumos.com/favicon.svg',
    description:
      'Ferrum OS is an AI-native construction platform that brings land intelligence, design, procurement, execution, and investment workflows into one system.',
    areaServed: 'Worldwide',
    sameAs: ['https://www.linkedin.com', 'https://www.facebook.com', 'https://www.x.com']
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchema,
      ...products.map((product) => ({
        '@type': 'Product',
        name: product.name,
        description: product.description,
        category: product.category,
        brand: {
          '@type': 'Brand',
          name: 'Ferrum OS'
        },
        manufacturer: {
          '@type': 'Organization',
          name: 'Ferrum OS'
        }
      }))
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
    </>
  );
}
