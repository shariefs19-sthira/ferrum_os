"use client";

import React from 'react';

// Import the RelumeComponent interface to ensure compliance
import type { RelumeComponent } from '../../../../packages/shared/src/relume-contracts';

const ProMarketPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-teal-700 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-4">ProMarket</h1>
        <p className="text-xl max-w-2xl mx-auto">
          Connect with verified professionals for your construction projects
        </p>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Hire Verified Professionals</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find and hire trusted contractors, architects, and engineers for your projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-green-600 text-2xl mb-4">👷</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Contractors</h3>
            <p className="text-gray-600">
              Access a network of pre-vetted and licensed construction professionals
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-green-600 text-2xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Project Matching</h3>
            <p className="text-gray-600">
              Our AI matches your project requirements with the right professionals
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-green-600 text-2xl mb-4">⭐</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ratings & Reviews</h3>
            <p className="text-gray-600">
              View detailed ratings and reviews from previous clients
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 px-4 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Find Your Perfect Professional?</h2>
          <p className="text-gray-600 mb-6">
            Join thousands of project owners who trust ProMarket to find reliable professionals
          </p>
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition">
            Browse Professionals
          </button>
        </div>
      </section>
    </div>
  );
};

export default ProMarketPage;