"use client";

import React from 'react';

// Import the RelumeComponent interface to ensure compliance
import type { RelumeComponent } from '../../../../packages/shared/src/relume-contracts';

const StructuraPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-4">Structura</h1>
        <p className="text-xl max-w-2xl mx-auto">
          Advanced structural analysis and design platform powered by AI
        </p>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Structural Analysis & Design</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Leverage AI-powered tools to analyze, design, and optimize your structural projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-2xl mb-4">🏗️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Load Analysis</h3>
            <p className="text-gray-600">
              Automatically calculate structural loads and stress distributions with precision
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-2xl mb-4">⚙️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Optimization</h3>
            <p className="text-gray-600">
              Optimize material usage and structural efficiency to reduce costs
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-2xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reporting</h3>
            <p className="text-gray-600">
              Generate comprehensive reports compliant with industry standards
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 px-4 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Transform Your Structural Design?</h2>
          <p className="text-gray-600 mb-6">
            Join thousands of engineers who trust Structura for their most complex projects
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition">
            Get Started Today
          </button>
        </div>
      </section>
    </div>
  );
};

export default StructuraPage;