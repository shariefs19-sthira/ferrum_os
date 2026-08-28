"use client";

import React from 'react';
import ProductPage from '../../components/ProductPage';
import { productsData } from '../../components/product-data';

const InvestFlowPage = () => {
  const product = productsData.find(p => p.slug === 'investflow');
  
  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <ProductPage
      productName={product.name}
      productDescription={product.description}
      primaryColor={product.primaryColor}
      secondaryColor={product.secondaryColor}
      accentColor={product.accentColor}
      components={product.components}
    />
  );
};

export default InvestFlowPage;