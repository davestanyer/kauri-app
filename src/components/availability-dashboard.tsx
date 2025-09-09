"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { parseCSV, getUniqueValues, type InventoryRow } from "@/lib/csv-parser";
import { 
  BarChart3, 
  TrendingDown,
  AlertCircle, 
  MapPin,
  Package,
  DollarSign
} from "lucide-react";

export function AvailabilityDashboard() {
  const [data, setData] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/Availability.csv');
        const csvContent = await response.text();
        const parsed = parseCSV(csvContent);
        setData(parsed);
      } catch (error) {
        console.error('Error loading CSV:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading dashboard...</div>;
  }

  // Key metrics for sales reps
  const totalQuantity = data.reduce((sum, row) => sum + row.QtyOnHand, 0);
  const totalValue = data.reduce((sum, row) => sum + (row.AmountOnHand || 0), 0);
  const totalRegions = getUniqueValues(data, 'WHRegion').length;
  
  // Items with stock
  const itemsWithStock = data.filter(row => row.QtyOnHand > 0);
  const availableItems = getUniqueValues(itemsWithStock, 'ITEMID').length;
  
  // Low stock warnings (items with less than 50 units)
  const lowStockItems = data.filter(row => row.QtyOnHand > 0 && row.QtyOnHand <= 50);
  const criticalStockItems = data.filter(row => row.QtyOnHand > 0 && row.QtyOnHand <= 10);
  

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600 bg-blue-100 rounded-lg p-2" />
              <div>
                <div className="text-lg font-bold text-gray-900">{availableItems}</div>
                <div className="text-xs text-gray-500">Available Items</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-green-600 bg-green-100 rounded-lg p-2" />
              <div>
                <div className="text-lg font-bold text-gray-900">{totalQuantity.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Total Units</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-purple-600 bg-purple-100 rounded-lg p-2" />
              <div>
                <div className="text-lg font-bold text-gray-900">${(totalValue / 1000).toFixed(0)}K</div>
                <div className="text-xs text-gray-500">Total Value</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8 text-teal-600 bg-teal-100 rounded-lg p-2" />
              <div>
                <div className="text-lg font-bold text-gray-900">{totalRegions}</div>
                <div className="text-xs text-gray-500">Regions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-amber-600 bg-amber-100 rounded-lg p-2" />
              <div>
                <div className="text-lg font-bold text-gray-900">{lowStockItems.length}</div>
                <div className="text-xs text-gray-500">Low Stock</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-red-200 border-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-8 h-8 text-red-600 bg-red-100 rounded-lg p-2" />
              <div>
                <div className="text-lg font-bold text-red-600">{criticalStockItems.length}</div>
                <div className="text-xs text-red-600 font-medium">Critical Stock</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}