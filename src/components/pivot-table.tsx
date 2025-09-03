"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import { ColumnVisibility } from "@/components/column-visibility";
import { parseCSV, pivotData, getUniqueValues, type InventoryRow, type PivotedItem } from "@/lib/csv-parser";
import { exportToExcel } from "@/lib/export-utils";
import { Search, Download } from "lucide-react";

const groupColors = {
  "Barrel Racks": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Bottles": "bg-blue-100 text-blue-800 border-blue-200",
  "Brewery": "bg-amber-100 text-amber-800 border-amber-200",
  "Bungs": "bg-orange-100 text-orange-800 border-orange-200",
  "Consumer Products": "bg-pink-100 text-pink-800 border-pink-200",
  "Fermentation Products": "bg-purple-100 text-purple-800 border-purple-200",
  "Lab Equipment": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Micro-Ox": "bg-cyan-100 text-cyan-800 border-cyan-200",
  "Oak Alternatives": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Rental": "bg-green-100 text-green-800 border-green-200",
  "Samples": "bg-rose-100 text-rose-800 border-rose-200",
  "Tannin": "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
  "Wine Barrels": "bg-red-100 text-red-800 border-red-200",
  "Winery Equipment": "bg-sky-100 text-sky-800 border-sky-200",
  "Other": "bg-gray-100 text-gray-800 border-gray-200"
};

export function PivotTable() {
  const [data, setData] = useState<InventoryRow[]>([]);
  const [pivotedData, setPivotedData] = useState<PivotedItem[]>([]);
  const [wmCodes, setWmCodes] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchText, setSearchText] = useState<string>("");
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/Availability.csv');
        const csvContent = await response.text();
        const parsed = parseCSV(csvContent);
        
        setData(parsed);
        setPivotedData(pivotData(parsed));
        setWmCodes(getUniqueValues(parsed, 'wmcode'));
        setRegions(getUniqueValues(parsed, 'WHRegion'));
        setGroups(getUniqueValues(parsed, 'GRP'));
        setCategories(getUniqueValues(parsed, 'UCat'));
        
        // Initialize all columns as visible
        const initialVisibility = getUniqueValues(parsed, 'wmcode').reduce((acc, code) => {
          acc[code] = true;
          return acc;
        }, {} as Record<string, boolean>);
        setVisibleColumns(initialVisibility);
      } catch (error) {
        console.error('Error loading CSV:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredData = pivotedData.filter(item => {
    if (selectedGroup !== "all" && item.group !== selectedGroup) return false;
    if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
    if (searchText && !item.itemId.toLowerCase().includes(searchText.toLowerCase()) && 
        !item.itemDesc.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });
  
  const visibleWmCodes = wmCodes.filter(code => visibleColumns[code]);

  const handleExport = () => {
    exportToExcel(
      filteredData,
      wmCodes,
      visibleColumns,
      groupedByRegion,
      'kauri-inventory'
    );
  };

  const groupedByRegion = regions.reduce((acc, region) => {
    const regionCodes = visibleWmCodes.filter(code => 
      data.some(row => row.wmcode === code && row.WHRegion === region)
    );
    if (regionCodes.length > 0) {
      acc[region] = regionCodes;
    }
    return acc;
  }, {} as Record<string, string[]>);

  if (loading) {
    return (
      <div className="w-full">
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="text-center">
            <div className="text-gray-500">Loading inventory data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header with Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Inventory Availability by Location</h3>
            <p className="text-sm text-gray-500 mt-1">{filteredData.length} items • Grouped by region and warehouse</p>
          </div>
          <div className="flex items-center gap-3">
            <ColumnVisibility
              columns={wmCodes}
              visibleColumns={visibleColumns}
              onToggle={(column) => setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }))}
              onToggleAll={(visible) => {
                const newState = wmCodes.reduce((acc, code) => {
                  acc[code] = visible;
                  return acc;
                }, {} as Record<string, boolean>);
                setVisibleColumns(newState);
              }}
            />
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export to Excel
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search items..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 w-64 text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Group:</label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                {groups.map(group => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Category:</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Pivot Table */}
      <div className="overflow-x-auto">
        <Table className="table-enterprise">
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-gray-50 border-r border-gray-200 min-w-32">Item ID</TableHead>
              <TableHead className="sticky left-32 bg-gray-50 border-r border-gray-200 min-w-80">Description</TableHead>
              <TableHead className="border-r border-gray-200 min-w-32">Group</TableHead>
              <TableHead className="border-r border-gray-200 min-w-24">Category</TableHead>
              {Object.entries(groupedByRegion).map(([region, codes]) => (
                <TableHead key={region} className="text-center border-r border-gray-200" colSpan={codes.length}>
                  {region}
                </TableHead>
              ))}
              <TableHead className="text-right font-semibold min-w-24">Total Qty</TableHead>
              <TableHead className="text-right min-w-24">Avg Cost</TableHead>
              <TableHead className="text-right min-w-32">Total Value</TableHead>
            </TableRow>
            <TableRow>
              <TableHead className="sticky left-0 bg-gray-50 border-r border-gray-200"></TableHead>
              <TableHead className="sticky left-32 bg-gray-50 border-r border-gray-200"></TableHead>
              <TableHead className="border-r border-gray-200"></TableHead>
              <TableHead className="border-r border-gray-200"></TableHead>
              {Object.entries(groupedByRegion).map(([region, codes]) => 
                codes.map(code => (
                  <TableHead key={`${region}-${code}`} className="text-center text-xs min-w-20">{code}</TableHead>
                ))
              )}
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item, index) => (
              <TableRow key={`${item.itemId}-${index}`} className="hover:bg-gray-50">
                <TableCell className="sticky left-0 bg-white border-r border-gray-100 text-sm font-medium">
                  {item.itemId}
                </TableCell>
                <TableCell className="sticky left-32 bg-white border-r border-gray-100 text-sm max-w-xs">
                  <div className="truncate" title={item.itemDesc}>
                    {item.itemDesc}
                  </div>
                </TableCell>
                <TableCell className="border-r border-gray-100">
                  <Badge className={`text-xs px-2 py-1 rounded-md font-medium border ${groupColors[item.group as keyof typeof groupColors] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
                    {item.group}
                  </Badge>
                </TableCell>
                <TableCell className="border-r border-gray-100 text-sm">{item.category}</TableCell>
                {Object.entries(groupedByRegion).map(([region, codes]) => 
                  codes.map(code => {
                    const quantity = item.quantities[code] || 0;
                    const lots = item.lotDetails[code] || [];
                    
                    const tooltipContent = lots.length > 0 ? (
                      <div className="space-y-1 max-w-xs">
                        <div className="font-semibold">Lot Details:</div>
                        {lots.map((lot, idx) => (
                          <div key={idx} className="text-xs">
                            <div>{lot.lotId}: {lot.qty.toLocaleString()} units</div>
                            <div className="text-gray-300">First: {lot.firstDate}</div>
                          </div>
                        ))}
                      </div>
                    ) : null;
                    
                    return (
                      <TableCell key={`${region}-${code}`} className="text-right text-sm">
                        {quantity > 0 ? (
                          tooltipContent ? (
                            <Tooltip content={tooltipContent}>
                              <span className="cursor-help hover:bg-blue-50 px-1 py-0.5 rounded">
                                {quantity.toLocaleString()}
                              </span>
                            </Tooltip>
                          ) : (
                            <span>{quantity.toLocaleString()}</span>
                          )
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    );
                  })
                )}
                <TableCell className="text-right text-sm font-bold">{item.totalQty.toLocaleString()}</TableCell>
                <TableCell className="text-right text-sm">${item.avgCost.toFixed(2)}</TableCell>
                <TableCell className="text-right text-sm font-semibold">${item.totalValue.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Showing {filteredData.length} items</span>
          <div className="flex items-center gap-4">
            <span>Total Items: <strong>{pivotedData.length}</strong></span>
            <span>Regions: <strong>{regions.length}</strong></span>
            <span>Warehouses: <strong>{wmCodes.length}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}