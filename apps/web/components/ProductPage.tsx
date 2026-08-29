"use client";

import React from 'react';
import Image from 'next/image';
import type { RelumeComponent } from '../../../packages/shared/src/relume-contracts';

interface ProductPageProps {
  productName: string;
  productDescription: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  components: RelumeComponent[];
}

const ProductPage: React.FC<ProductPageProps> = ({
  productName,
  productDescription,
  primaryColor,
  secondaryColor,
  accentColor,
  components
}) => {
  // Helper function to get color classes based on product theme
  const getColorClass = (type: 'primary' | 'secondary' | 'accent') => {
    switch(type) {
      case 'primary':
        return primaryColor;
      case 'secondary':
        return secondaryColor;
      case 'accent':
        return accentColor;
      default:
        return 'bg-gray-50';
    }
  };

  // Focus visible styles for better keyboard navigation
  const focusVisibleStyle = "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";

  // Render individual Relume components
  const renderComponent = (component: RelumeComponent) => {
    switch(component.type) {
      case 'hero':
        return (
          <section 
            className={`bg-gradient-to-r ${getColorClass('primary')} ${getColorClass('secondary')} text-white py-16 px-4 text-center`}
            aria-labelledby="hero-title"
          >
            <h1 id="hero-title" className="text-4xl font-extrabold mb-4">{component.props.title || productName}</h1>
            <p className="text-xl max-w-2xl mx-auto">
              {component.props.description || productDescription}
            </p>
            {component.props.imageSrc && (
              <div className="mt-8 max-w-2xl mx-auto">
                <Image
                  src={component.props.imageSrc}
                  alt={`${component.props.title || productName} hero illustration`}
                  width={800}
                  height={400}
                  className="w-full h-auto rounded-lg shadow-lg"
                  priority
                />
              </div>
            )}
          </section>
        );
      
      case 'features':
        return (
          <section className="py-12 px-4 max-w-7xl mx-auto" aria-labelledby="features-title">
            <div className="text-center mb-12">
              <h2 id="features-title" className="text-3xl font-bold text-gray-900 mb-4">
                {component.props.title || `${productName} Features`}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {component.props.description || 'Key features and capabilities'}
              </p>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`}>
              {(component.props.features || []).map((feature: any, index: number) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-200" tabIndex={0}>
                  <div className={`${getColorClass('accent')} text-2xl mb-4`} role="img" aria-hidden="true">
                    {feature.icon || '✨'}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title || `Feature ${index + 1}`}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description || 'Feature description'}
                  </p>
                  {feature.imageSrc && (
                    <div className="mt-4">
                      <Image
                        src={feature.imageSrc}
                        alt={`${feature.title || `Feature ${index + 1}`} illustration`}
                        width={300}
                        height={200}
                        className="w-full h-auto rounded-md"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case 'pricing':
        return (
          <section className={`py-12 px-4 ${component.props.backgroundColor || 'bg-gray-100'}`} aria-labelledby="pricing-title">
            <div className="max-w-4xl mx-auto text-center">
              <h2 id="pricing-title" className="text-3xl font-bold text-gray-900 mb-4">
                {component.props.title || 'Pricing Plans'}
              </h2>
              <p className="text-gray-600 mb-6">
                {component.props.description || 'Choose the plan that works best for you'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(component.props.plans || []).map((plan: any, index: number) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-200" tabIndex={0}>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name || `Plan ${index + 1}`}</h3>
                    <p className="text-2xl font-bold mb-4">{plan.price || '$0'}/{plan.period || 'mo'}</p>
                    <ul className="text-left mb-4" aria-label={`${plan.name || `Plan ${index + 1}`} features`}>
                      {(plan.features || []).map((feature: string, idx: number) => (
                        <li key={idx} className="mb-1" aria-hidden="true">✓ {feature}</li>
                      ))}
                    </ul>
                    <button 
                      className={`${getColorClass('primary')} hover:${getColorClass('secondary')} text-white font-bold py-3 px-6 rounded-lg transition ${focusVisibleStyle}`}
                      aria-label={`Get started with ${plan.name || `Plan ${index + 1}`}`}
                    >
                      {plan.buttonText || 'Get Started'}
                    </button>
                    {plan.imageSrc && (
                      <div className="mt-4">
                        <Image
                          src={plan.imageSrc}
                          alt={`${plan.name || `Plan ${index + 1}`} plan illustration`}
                          width={400}
                          height={200}
                          className="w-full h-auto rounded-md"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" role="main">
      {components.map((component, index) => (
        <div key={component.id || index} className={index === 0 ? '' : 'pt-12'}>
          {renderComponent(component)}
        </div>
      ))}
      
      {/* Accessibility-focused styles */}
      <style jsx global>{`
        /* Focus visible styles for keyboard navigation */
        *:focus {
          outline: none;
        }
        
        button:focus,
        input:focus,
        select:focus,
        textarea:focus,
        [tabindex]:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .shadow-md {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          
          .border-gray-200 {
            border-color: #374151;
          }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        /* Color contrast improvements */
        .text-gray-600 {
          color: #4b5563;
        }
        
        .text-gray-900 {
          color: #111827;
        }
        
        /* Skip to content link for screen readers */
        .skip-to-content {
          position: absolute;
          top: -40px;
          left: 0;
          background: #1f2937;
          color: white;
          padding: 8px;
          text-decoration: none;
          border-radius: 0 0 4px 0;
          z-index: 100;
        }
        
        .skip-to-content:focus {
          top: 0;
        }
      `}</style>
    </div>
  );
};

export default ProductPage;