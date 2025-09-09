import { DashboardHeader } from "@/components/dashboard-header";
import { PivotTable } from "@/components/pivot-table";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="w-full px-4 py-6 max-w-none">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Inventory Management
          </h1>
          <p className="text-gray-600 text-sm">
            Real-time tracking for Kauri&apos;s premium barrel and bottle collection
          </p>
        </div>

        {/* Main Pivot Table */}
        <div className="card-enterprise w-full">
          <PivotTable />
        </div>
      </main>
    </div>
  );
}
