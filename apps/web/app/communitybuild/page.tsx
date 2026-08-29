"use client";

import React from 'react';
import CommunityBuildFeatures from '../../components/CommunityBuildFeatures';
import ProductPage from '../../components/ProductPage';
import { productsData } from '../../components/product-data';

const CommunityBuildPage = () => {
  const product = productsData.find(p => p.slug === 'communitybuild');
  
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
      <CommunityBuildFeatures />
    </>
  );
};

export default CommunityBuildPage;