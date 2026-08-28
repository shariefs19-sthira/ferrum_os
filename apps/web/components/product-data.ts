import type { RelumeComponent } from '../../packages/shared/src/relume-contracts';

// Define the structure for product data
export interface ProductData {
  slug: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  components: RelumeComponent[];
}

// Product data for all Ferrum OS products
export const productsData: ProductData[] = [
  {
    slug: 'structura',
    name: 'Structura',
    description: 'Structural analysis & design',
    primaryColor: 'from-blue-600',
    secondaryColor: 'to-purple-700',
    accentColor: 'text-blue-600',
    components: [
      {
        id: 'hero-1',
        type: 'hero',
        props: {
          title: 'Structura',
          description: 'Advanced structural analysis and design platform'
        }
      },
      {
        id: 'features-1',
        type: 'features',
        props: {
          title: 'Structural Analysis & Design',
          description: 'Powerful tools for engineering excellence',
          features: [
            {
              icon: '🏗️',
              title: 'Structural Modeling',
              description: 'Create detailed 3D models of structures with advanced physics'
            },
            {
              icon: '🔍',
              title: 'Load Analysis',
              description: 'Analyze various load conditions and stress factors'
            },
            {
              icon: '📊',
              title: 'Performance Reports',
              description: 'Generate comprehensive reports on structural integrity'
            }
          ]
        }
      },
      {
        id: 'cta-1',
        type: 'pricing',
        props: {
          title: 'Ready to Optimize Your Structural Designs?',
          description: 'Join thousands of engineers using Structura for better structural analysis',
          backgroundColor: 'bg-gray-100',
          plans: [
            {
              name: 'Professional',
              price: 'Contact Us',
              period: '',
              features: [
                'Unlimited projects',
                'Advanced modeling tools',
                'Priority support'
              ],
              buttonText: 'Request Demo'
            }
          ]
        }
      }
    ]
  },
  {
    slug: 'promarket',
    name: 'ProMarket',
    description: 'Hire verified professionals',
    primaryColor: 'from-green-600',
    secondaryColor: 'to-teal-700',
    accentColor: 'text-green-600',
    components: [
      {
        id: 'hero-1',
        type: 'hero',
        props: {
          title: 'ProMarket',
          description: 'Connect with verified professionals for your construction projects'
        }
      },
      {
        id: 'features-1',
        type: 'features',
        props: {
          title: 'Hire Verified Professionals',
          description: 'Find and hire trusted contractors, architects, and engineers for your projects',
          features: [
            {
              icon: '👷',
              title: 'Verified Contractors',
              description: 'Access a network of pre-vetted and licensed construction professionals'
            },
            {
              icon: '📋',
              title: 'Project Matching',
              description: 'Our AI matches your project requirements with the right professionals'
            },
            {
              icon: '⭐',
              title: 'Ratings & Reviews',
              description: 'View detailed ratings and reviews from previous clients'
            }
          ]
        }
      },
      {
        id: 'cta-1',
        type: 'pricing',
        props: {
          title: 'Ready to Find Your Perfect Professional?',
          description: 'Join thousands of project owners who trust ProMarket to find reliable professionals',
          backgroundColor: 'bg-gray-100',
          plans: [
            {
              name: 'Basic Plan',
              price: 'Free',
              period: '',
              features: [
                'Browse professionals',
                'View profiles',
                'Basic contact'
              ],
              buttonText: 'Browse Professionals'
            }
          ]
        }
      }
    ]
  },
  {
    slug: 'buildos',
    name: 'BuildOS',
    description: 'Construction project management',
    primaryColor: 'from-orange-600',
    secondaryColor: 'to-red-700',
    accentColor: 'text-orange-600',
    components: [
      {
        id: 'hero-1',
        type: 'hero',
        props: {
          title: 'BuildOS',
          description: 'Comprehensive construction project management platform'
        }
      },
      {
        id: 'features-1',
        type: 'features',
        props: {
          title: 'Construction Project Management',
          description: 'Streamline your construction projects with our all-in-one management solution',
          features: [
            {
              icon: '📅',
              title: 'Project Planning',
              description: 'Create detailed project timelines and milestones with Gantt charts'
            },
            {
              icon: '👥',
              title: 'Team Collaboration',
              description: 'Coordinate with architects, contractors, and stakeholders in real-time'
            },
            {
              icon: '📊',
              title: 'Progress Tracking',
              description: 'Monitor project progress with real-time dashboards and reporting'
            }
          ]
        }
      },
      {
        id: 'cta-1',
        type: 'pricing',
        props: {
          title: 'Ready to Transform Your Project Management?',
          description: 'Join thousands of project managers who trust BuildOS to deliver projects on time and on budget',
          backgroundColor: 'bg-gray-100',
          plans: [
            {
              name: 'Starter',
              price: '$49',
              period: 'mo',
              features: [
                'Up to 5 projects',
                'Basic collaboration',
                'Standard reporting'
              ],
              buttonText: 'Start Managing Projects'
            }
          ]
        }
      }
    ]
  },
  {
    slug: 'procurehub',
    name: 'ProcureHub',
    description: 'Material procurement',
    primaryColor: 'from-indigo-600',
    secondaryColor: 'to-purple-700',
    accentColor: 'text-indigo-600',
    components: [
      {
        id: 'hero-1',
        type: 'hero',
        props: {
          title: 'ProcureHub',
          description: 'Streamlined material procurement for construction projects'
        }
      },
      {
        id: 'features-1',
        type: 'features',
        props: {
          title: 'Material Procurement',
          description: 'Efficiently source and manage materials for your construction projects',
          features: [
            {
              icon: '🚚',
              title: 'Supplier Network',
              description: 'Access vetted suppliers offering competitive prices and quality materials'
            },
            {
              icon: '📋',
              title: 'Order Management',
              description: 'Track orders from placement to delivery with real-time status updates'
            },
            {
              icon: '💰',
              title: 'Cost Optimization',
              description: 'Compare prices across suppliers to optimize your procurement costs'
            }
          ]
        }
      },
      {
        id: 'cta-1',
        type: 'pricing',
        props: {
          title: 'Ready to Simplify Your Material Procurement?',
          description: 'Join thousands of contractors who trust ProcureHub to streamline their material sourcing',
          backgroundColor: 'bg-gray-100',
          plans: [
            {
              name: 'Business',
              price: '$99',
              period: 'mo',
              features: [
                'Unlimited orders',
                'Supplier analytics',
                'Dedicated account manager'
              ],
              buttonText: 'Start Procuring Materials'
            }
          ]
        }
      }
    ]
  },
  {
    slug: 'investflow',
    name: 'InvestFlow',
    description: 'Investment forecasting',
    primaryColor: 'from-emerald-600',
    secondaryColor: 'to-cyan-700',
    accentColor: 'text-emerald-600',
    components: [
      {
        id: 'hero-1',
        type: 'hero',
        props: {
          title: 'InvestFlow',
          description: 'Smart investment forecasting for real estate projects'
        }
      },
      {
        id: 'features-1',
        type: 'features',
        props: {
          title: 'Investment Forecasting',
          description: 'Predict market trends and ROI for your real estate investments',
          features: [
            {
              icon: '📈',
              title: 'Market Analysis',
              description: 'AI-powered analysis of market conditions and trends'
            },
            {
              icon: '🔮',
              title: 'ROI Prediction',
              description: 'Accurate forecasting of return on investment'
            },
            {
              icon: '📋',
              title: 'Risk Assessment',
              description: 'Evaluate potential risks in your investment portfolio'
            }
          ]
        }
      },
      {
        id: 'cta-1',
        type: 'pricing',
        props: {
          title: 'Ready to Optimize Your Investment Strategy?',
          description: 'Join thousands of investors using InvestFlow to maximize their returns',
          backgroundColor: 'bg-gray-100',
          plans: [
            {
              name: 'Investor',
              price: '$149',
              period: 'mo',
              features: [
                'Portfolio tracking',
                'Custom forecasts',
                'Expert insights'
              ],
              buttonText: 'Start Forecasting'
            }
          ]
        }
      }
    ]
  },
  {
    slug: 'communitybuild',
    name: 'CommunityBuild',
    description: 'Fractional development',
    primaryColor: 'from-amber-600',
    secondaryColor: 'to-yellow-700',
    accentColor: 'text-amber-600',
    components: [
      {
        id: 'hero-1',
        type: 'hero',
        props: {
          title: 'CommunityBuild',
          description: 'Fractional ownership platform for real estate development'
        }
      },
      {
        id: 'features-1',
        type: 'features',
        props: {
          title: 'Fractional Development',
          description: 'Participate in real estate projects with shared ownership models',
          features: [
            {
              icon: '🏢',
              title: 'Property Fractionalization',
              description: 'Buy shares in premium real estate properties'
            },
            {
              icon: '🤝',
              title: 'Community Investing',
              description: 'Join forces with other investors to purchase larger assets'
            },
            {
              icon: '💳',
              title: 'Revenue Sharing',
              description: 'Earn passive income from rental yields and property appreciation'
            }
          ]
        }
      },
      {
        id: 'cta-1',
        type: 'pricing',
        props: {
          title: 'Ready to Participate in Real Estate Innovation?',
          description: 'Join thousands of users building wealth through fractional ownership',
          backgroundColor: 'bg-gray-100',
          plans: [
            {
              name: 'Starter',
              price: 'Free',
              period: '',
              features: [
                'Browse opportunities',
                'Basic analytics',
                'Community access'
              ],
              buttonText: 'Explore Opportunities'
            }
          ]
        }
      }
    ]
  }
];