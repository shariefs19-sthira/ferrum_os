"use client";

import React from 'react';
import ProcureHubFeatures from '../../components/ProcureHubFeatures';
import ProductPage from '../../components/ProductPage';
import { productsData } from '../../components/product-data';

const ProcureHubPage = () => {
  const product = productsData.find(p => p.slug === 'procurehub');
  
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
      <ProcureHubFeatures />
    </>
  );
};

export default ProcureHubPage;