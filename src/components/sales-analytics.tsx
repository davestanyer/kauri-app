"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { parseCSV, getUniqueValues, type InventoryRow } from "@/lib/csv-parser";
import { 
  TrendingUp, 
  AlertTriangle, 
  MapPin
} from "lucide-react";

interface RegionalStats {
  region: string;
  totalItems: number;
  totalQty: number;
  totalValue: number;
  warehouses: number;
  lowStockItems: number;
}

interface CategoryStats {
  category: string;
  totalQty: number;
  totalValue: number;
  items: number;
  avgValue: number;
}

export function SalesAnalytics() {
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
    return <div className="text-gray-500">Loading analytics...</div>;
  }

  // Calculate regional statistics
  const regionalStats: RegionalStats[] = getUniqueValues(data, 'WHRegion').map(region => {
    const regionData = data.filter(row => row.WHRegion === region);
    const warehouses = getUniqueValues(regionData, 'wmcode').length;
    const lowStockItems = regionData.filter(row => row.QtyOnHand > 0 && row.QtyOnHand <= 50).length;
    
    return {
      region,
      totalItems: getUniqueValues(regionData, 'ITEMID').length,
      totalQty: regionData.reduce((sum, row) => sum + row.QtyOnHand, 0),
      totalValue: regionData.reduce((sum, row) => sum + (row.AmountOnHand || 0), 0),
      warehouses,
      lowStockItems
    };
  }).sort((a, b) => b.totalValue - a.totalValue);

  // Calculate category statistics
  const categoryStats: CategoryStats[] = getUniqueValues(data, 'GRP').map(category => {
    const categoryData = data.filter(row => row.GRP === category);
    const totalValue = categoryData.reduce((sum, row) => sum + (row.AmountOnHand || 0), 0);
    const items = getUniqueValues(categoryData, 'ITEMID').length;
    
    return {
      category,
      totalQty: categoryData.reduce((sum, row) => sum + row.QtyOnHand, 0),
      totalValue,
      items,
      avgValue: items > 0 ? totalValue / items : 0
    };
  }).sort((a, b) => b.totalValue - a.totalValue);

  // Low stock alerts
  const lowStockAlerts = data
    .filter(row => row.QtyOnHand > 0 && row.QtyOnHand <= 20)
    .sort((a, b) => a.QtyOnHand - b.QtyOnHand)
    .slice(0, 8);

  // High value items
  const highValueItems = data
    .filter(row => (row.AmountOnHand || 0) > 1000)
    .sort((a, b) => (b.AmountOnHand || 0) - (a.AmountOnHand || 0))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Regional Overview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Availability</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regionalStats.map((stats) => (
            <Card key={stats.region} className="bg-white border border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">{stats.region}</CardTitle>
                  <MapPin className="w-4 h-4 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Total Quantity</span>
                  <span className="text-sm font-semibold">{stats.totalQty.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Total Value</span>
                  <span className="text-sm font-semibold">${stats.totalValue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Warehouses</span>
                  <span className="text-sm font-medium">{stats.warehouses}</span>
                </div>
                {stats.lowStockItems > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-red-600">Low Stock Items</span>
                    <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                      {stats.lowStockItems}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Category Performance */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryStats.map((stats) => (
            <Card key={stats.category} className="bg-white border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stats.category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xl font-bold text-gray-900">{stats.totalQty.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Total Units</div>
                <div className="text-sm font-medium">${stats.totalValue.toLocaleString()}</div>
                <div className="text-xs text-gray-500">{stats.items} unique items</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockAlerts.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">{item.ITEMDESC}</div>
                    <div className="text-xs text-gray-500">{item.ITEMID} • {item.wmcode}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-red-600">{item.QtyOnHand}</div>
                    <div className="text-xs text-gray-500">units left</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* High Value Items */}
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              High Value Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highValueItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">{item.ITEMDESC}</div>
                    <div className="text-xs text-gray-500">{item.ITEMID} • {item.wmcode}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-600">${(item.AmountOnHand || 0).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{item.QtyOnHand} units</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}