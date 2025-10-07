"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { PivotTable } from "@/components/pivot-table";
import { BarrelAvailability } from "@/components/barrel-availability";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'barrels'>('inventory');

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="w-full px-4 py-6 max-w-none">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {activeTab === 'inventory' ? 'Inventory Management' : 'Barrel Availability'}
          </h1>
          <p className="text-gray-600 text-sm">
            {activeTab === 'inventory' 
              ? "Real-time tracking for Kauri's premium barrel and bottle collection"
              : "Current barrel stock availability across all locations"}
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'inventory'
                  ? 'border-logo-green text-logo-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Inventory Overview
            </button>
            <button
              onClick={() => setActiveTab('barrels')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'barrels'
                  ? 'border-logo-green text-logo-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Barrel Availability
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="card-enterprise w-full">
          {activeTab === 'inventory' ? <PivotTable /> : <BarrelAvailability />}
        </div>
      </main>
    </div>
  );
}
