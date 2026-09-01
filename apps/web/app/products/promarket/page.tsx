"use client";

import React from 'react';
import ProMarketFeatures from '../../../components/ProMarketFeatures';
import ProductPage from '../../../components/ProductPage';
import { productsData } from '../../../components/product-data';

const ProMarketPage = () => {
  const product = productsData.find(p => p.slug === 'promarket');
  
  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <>
      <ProductPage
        productName={product.name}
        productDescription={product.description}
        primaryColor={product.primaryColor}
        secondaryColor={product.secondaryColor}
        accentColor={product.accentColor}
        components={product.components}
      />
      <ProMarketFeatures />
    </>
  );
};

export default ProMarketPage;