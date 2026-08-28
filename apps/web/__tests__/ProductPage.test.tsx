import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductPage from '../components/ProductPage';
import { productsData } from '../components/product-data';
import type { ProductData } from '../components/product-data';

describe('ProductPage', () => {
  it.each(productsData.map(p => [p.slug, p] as [string, ProductData]))(
    'renders hero section for %s',
    (slug, product) => {
      render(
        <ProductPage
          productName={product.name}
          productDescription={product.description}
          primaryColor={product.primaryColor}
          secondaryColor={product.secondaryColor}
          accentColor={product.accentColor}
          components={product.components}
        />
      );

      // Check if the hero component is rendered by looking for its title or description
      const heroComponent = product.components.find(c => c.type === 'hero');
      if (heroComponent) {
        const title = heroComponent.props.title || product.name;
        expect(screen.getByText(title)).toBeInTheDocument();
      }
    }
  );

  it.each(productsData.map(p => [p.slug, p] as [string, ProductData]))(
    'renders features section for %s',
    (slug, product) => {
      render(
        <ProductPage
          productName={product.name}
          productDescription={product.description}
          primaryColor={product.primaryColor}
          secondaryColor={product.secondaryColor}
          accentColor={product.accentColor}
          components={product.components}
        />
      );

      // Check if the features component is rendered by looking for its title or description
      const featuresComponent = product.components.find(c => c.type === 'features');
      if (featuresComponent) {
        const title = featuresComponent.props.title || `${product.name} Features`;
        expect(screen.getByText(title)).toBeInTheDocument();
      }
    }
  );

  it.each(productsData.map(p => [p.slug, p] as [string, ProductData]))(
    'renders pricing section for %s',
    (slug, product) => {
      render(
        <ProductPage
          productName={product.name}
          productDescription={product.description}
          primaryColor={product.primaryColor}
          secondaryColor={product.secondaryColor}
          accentColor={product.accentColor}
          components={product.components}
        />
      );

      // Check if the pricing component is rendered by looking for its title or description
      const pricingComponent = product.components.find(c => c.type === 'pricing');
      if (pricingComponent) {
        const title = pricingComponent.props.title || 'Pricing Plans';
        expect(screen.getByText(title)).toBeInTheDocument();
      }
    }
  );
});