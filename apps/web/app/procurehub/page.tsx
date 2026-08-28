"use client";

import React from 'react';

// Import the RelumeComponent interface to ensure compliance
import type { RelumeComponent } from '../../../../packages/shared/src/relume-contracts';

const ProcureHubPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-4">ProcureHub</h1>
        <p className="text-xl max-w-2xl mx-auto">
          Streamlined material procurement for construction projects
        </p>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Material Procurement</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Efficiently source and manage materials for your construction projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-indigo-600 text-2xl mb-4">🚚</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Supplier Network</h3>
            <p className="text-gray-600">
              Access vetted suppliers offering competitive prices and quality materials
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-indigo-600 text-2xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Order Management</h3>
            <p className="text-gray-600">
              Track orders from placement to delivery with real-time status updates
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-indigo-600 text-2xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cost Optimization</h3>
            <p className="text-gray-600">
              Compare prices across suppliers to optimize your procurement costs
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 px-4 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Simplify Your Material Procurement?</h2>
          <p className="text-gray-600 mb-6">
            Join thousands of contractors who trust ProcureHub to streamline their material sourcing
          </p>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition">
            Start Procuring Materials
          </button>
        </div>
      </section>
    </div>
  );
};

export default ProcureHubPage;