import { describe, it, expect } from 'vitest';
import { productsData } from '../components/product-data';

// Define the slugs that are present in the product-data.ts file
const PRODUCT_DATA_SLUGS = [
  'structura',
  'promarket',
  'buildos',
  'procurehub',
  'investflow',
  'communitybuild',
  // Note: landintel, boq-pro, designstudio are in the home page list but not in product-data.ts
];

describe('Product Data Contract Tests (for components/product-data.ts)', () => {
  it('should have exactly 6 products in the product-data.ts file', () => {
    expect(productsData).toHaveLength(PRODUCT_DATA_SLUGS.length);
  });

  it('should have the correct slugs for products in product-data.ts', () => {
    const actualSlugs = productsData.map(p => p.slug);
    expect(actualSlugs).toEqual(PRODUCT_DATA_SLUGS);
  });

  it('should have required fields for each product in product-data.ts', () => {
    productsData.forEach(product => {
      expect(product).toHaveProperty('slug');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('primaryColor');
      expect(product).toHaveProperty('secondaryColor');
      expect(product).toHaveProperty('accentColor');
      expect(product).toHaveProperty('components');
      expect(Array.isArray(product.components)).toBe(true);
    });
  });

  it('should have hero, features, and pricing components for each product in product-data.ts', () => {
    productsData.forEach(product => {
      const componentTypes = product.components.map(c => c.type);
      expect(componentTypes).toContain('hero');
      expect(componentTypes).toContain('features');
      expect(componentTypes).toContain('pricing');
    });
  });
});