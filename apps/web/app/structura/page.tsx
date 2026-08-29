"use client";

import React from 'react';
import StructuraFeatures from '../../components/StructuraFeatures';
import ProductPage from '../../components/ProductPage';
import { productsData } from '../../components/product-data';

const StructuraPage = () => {
  const product = productsData.find(p => p.slug === 'structura');
  
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
      <StructuraFeatures />
    </>
  );
};

export default StructuraPage;