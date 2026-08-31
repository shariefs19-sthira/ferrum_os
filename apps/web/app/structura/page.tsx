"use client";

import React from 'react';
import StructuraFeatures from '../../components/StructuraFeatures';
import ProductPage from '../../components/ProductPage';
import StatCallout from '../../components/StatCallout';
import { productsData } from '../../components/product-data';

const beamTable = [
  { spanM: '3.0', widthMm: '230', depthMm: '300', steelKg: '9.5', use: 'Residential, light partitions' },
  { spanM: '4.0', widthMm: '230', depthMm: '380', steelKg: '14.2', use: 'Residential, room floors' },
  { spanM: '5.0', widthMm: '230', depthMm: '450', steelKg: '19.8', use: 'Residential + small commercial' },
  { spanM: '6.0', widthMm: '300', depthMm: '530', steelKg: '26.4', use: 'Commercial floors, parking' },
  { spanM: '7.5', widthMm: '300', depthMm: '600', steelKg: '34.7', use: 'Heavy commercial, offices' },
  { spanM: '9.0', widthMm: '300', depthMm: '700', steelKg: '44.1', use: 'Long-span commercial, industrial' },
];

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

      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Quick lookup</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Beam-size reference table
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Indicative RC beam sizes for common residential and commercial spans, derived from
              IS 456 for M25 concrete and Fe500 reinforcement. Use as a pre-design starting point
              only &mdash; verify with a qualified structural engineer before finalising sections.
            </p>
          </div>

          <div className="mb-8">
            <StatCallout
              stats={[
                { value: '6', label: 'span sizes covered (3.0m–9.0m)' },
                { value: 'IS 456', label: 'M25 concrete, Fe500 reinforcement' },
                { value: '5', label: 'use-case tiers, residential to industrial' },
              ]}
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Span (m)</th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Width (mm)</th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Depth (mm)</th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Steel (kg/m)</th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Typical use</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {beamTable.map((row) => (
                  <tr key={row.spanM} className="align-top">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{row.spanM}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{row.widthMm}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{row.depthMm}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{row.steelKg}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Values are indicative and rounded. Live BoQ quantities, exact reinforcement, and
            deflection checks should be generated in Structura for your specific load case.
          </p>
        </div>
      </section>

      <StructuraFeatures />
    </>
  );
};

export default StructuraPage;