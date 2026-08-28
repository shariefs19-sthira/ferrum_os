"use client";

import React from 'react';
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

  // Render individual Relume components
  const renderComponent = (component: RelumeComponent) => {
    switch(component.type) {
      case 'hero':
        return (
          <section 
            className={`bg-gradient-to-r ${getColorClass('primary')} ${getColorClass('secondary')} text-white py-16 px-4 text-center`}
          >
            <h1 className="text-4xl font-extrabold mb-4">{component.props.title || productName}</h1>
            <p className="text-xl max-w-2xl mx-auto">
              {component.props.description || productDescription}
            </p>
          </section>
        );
      
      case 'features':
        return (
          <section className="py-12 px-4 max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {component.props.title || `${productName} Features`}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {component.props.description || 'Key features and capabilities'}
              </p>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`}>
              {(component.props.features || []).map((feature: any, index: number) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <div className={`${getColorClass('accent')} text-2xl mb-4`}>
                    {feature.icon || '✨'}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title || `Feature ${index + 1}`}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description || 'Feature description'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        );

      case 'pricing':
        return (
          <section className={`py-12 px-4 ${component.props.backgroundColor || 'bg-gray-100'}`}>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {component.props.title || 'Pricing Plans'}
              </h2>
              <p className="text-gray-600 mb-6">
                {component.props.description || 'Choose the plan that works best for you'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(component.props.plans || []).map((plan: any, index: number) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name || `Plan ${index + 1}`}</h3>
                    <p className="text-2xl font-bold mb-4">{plan.price || '$0'}/{plan.period || 'mo'}</p>
                    <ul className="text-left mb-4">
                      {(plan.features || []).map((feature: string, idx: number) => (
                        <li key={idx} className="mb-1">✓ {feature}</li>
                      ))}
                    </ul>
                    <button className={`${getColorClass('primary')} hover:${getColorClass('secondary')} text-white font-bold py-3 px-6 rounded-lg transition`}>
                      {plan.buttonText || 'Get Started'}
                    </button>
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
    <div className="min-h-screen bg-gray-50">
      {components.map((component, index) => (
        <div key={component.id || index}>
          {renderComponent(component)}
        </div>
      ))}
    </div>
  );
};

export default ProductPage;