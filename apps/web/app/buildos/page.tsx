"use client";

import React from 'react';

// Import the RelumeComponent interface to ensure compliance
import type { RelumeComponent } from '../../../../packages/shared/src/relume-contracts';

const BuildOSPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-red-700 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-4">BuildOS</h1>
        <p className="text-xl max-w-2xl mx-auto">
          Comprehensive construction project management platform
        </p>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Construction Project Management</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Streamline your construction projects with our all-in-one management solution
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-orange-600 text-2xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Project Planning</h3>
            <p className="text-gray-600">
              Create detailed project timelines and milestones with Gantt charts
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-orange-600 text-2xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Team Collaboration</h3>
            <p className="text-gray-600">
              Coordinate with architects, contractors, and stakeholders in real-time
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-orange-600 text-2xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Progress Tracking</h3>
            <p className="text-gray-600">
              Monitor project progress with real-time dashboards and reporting
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 px-4 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Transform Your Project Management?</h2>
          <p className="text-gray-600 mb-6">
            Join thousands of project managers who trust BuildOS to deliver projects on time and on budget
          </p>
          <button className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition">
            Start Managing Projects
          </button>
        </div>
      </section>
    </div>
  );
};

export default BuildOSPage;