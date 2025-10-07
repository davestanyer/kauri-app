"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { parseCSV, pivotData, getUniqueValues, getUniqueWarehouseNames, getUniqueCompanies, type InventoryRow, type PivotedItem } from "@/lib/csv-parser";
import { exportToExcel } from "@/lib/export-utils";
import { Search, Download, ChevronRight, X } from "lucide-react";

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

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemData: PivotedItem | null;
  regions: string[];
  warehousesByRegion: Record<string, string[]>;
}

function DetailModal({ isOpen, onClose, itemData, regions, warehousesByRegion }: DetailModalProps) {
  if (!isOpen || !itemData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">{itemData.Description}</h2>
            <p className="text-sm text-gray-600">Item ID: {itemData.ItemID}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-sm font-medium text-gray-600">Group:</span>
              <Badge className={`ml-2 ${groupColors[itemData.GRP] || groupColors["Other"]}`}>
                {itemData.GRP}
              </Badge>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Total Quantity:</span>
              <span className="ml-2 font-bold text-lg">{(itemData.total || 0).toLocaleString()}</span>
            </div>
          </div>

          <h3 className="font-semibold mb-3">Warehouse Breakdown by Region</h3>
          <div className="space-y-4">
            {regions.map(region => {
              const regionWarehouses = warehousesByRegion[region] || [];
              const regionTotal = regionWarehouses.reduce((sum, wh) => sum + (itemData.quantities[wh] || 0), 0);
              
              if (regionTotal === 0) return null;
              
              return (
                <div key={region} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-sm">{region}</h4>
                    <span className="text-sm font-bold">{(regionTotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {regionWarehouses.map(warehouse => {
                      const qty = itemData.quantities[warehouse] || 0;
                      const lots = itemData.lotDetails[warehouse] || [];
                      
                      if (qty === 0) return null;
                      
                      return (
                        <div key={warehouse} className="bg-gray-50 rounded p-2">
                          <div className="text-xs font-medium text-gray-600">{warehouse}</div>
                          <div className="font-bold">{(qty || 0).toLocaleString()}</div>
                          {lots.length > 0 && (
                            <div className="mt-1 text-xs text-gray-500">
                              {lots.length} lot{lots.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PivotTableRegional() {
  const [data, setData] = useState<InventoryRow[]>([]);
  const [pivotedData, setPivotedData] = useState<PivotedItem[]>([]);
  const [warehouseNames, setWarehouseNames] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PivotedItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/Available2.csv');
        const csvContent = await response.text();
        const parsed = parseCSV(csvContent);
        
        setData(parsed);
        const availableCompanies = getUniqueCompanies(parsed).filter(company => 
          company && company !== 'undefined' && company !== 'null' && company.trim() !== ''
        );
        
        setCompanies(availableCompanies);
        
        let filteredData = parsed;
        
        if (availableCompanies.length > 0) {
          const initialCompany = availableCompanies.includes("KALP") ? "KALP" : availableCompanies[0];
          setSelectedCompany(initialCompany);
          filteredData = parsed.filter(row => row.Company === initialCompany);
        } else {
          setSelectedCompany("");
        }
          
        setPivotedData(pivotData(filteredData));
        setWarehouseNames(getUniqueWarehouseNames(filteredData));
        setRegions(getUniqueValues(filteredData, 'WHRegion'));
        setGroups(getUniqueValues(filteredData, 'GRP'));
      } catch (error) {
        console.error('Error loading CSV:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (data.length > 0 && companies.length > 0 && selectedCompany) {
      const filteredData = data.filter(row => row.Company === selectedCompany);
      setPivotedData(pivotData(filteredData));
      setWarehouseNames(getUniqueWarehouseNames(filteredData));
      setRegions(getUniqueValues(filteredData, 'WHRegion'));
      setGroups(getUniqueValues(filteredData, 'GRP'));
    }
  }, [selectedCompany, data, companies]);

  const filteredData = pivotedData
    .filter(item => {
      if (selectedGroup !== "all" && item.GRP !== selectedGroup) return false;
      if (searchText && !item.Description.toLowerCase().includes(searchText.toLowerCase()) &&
          !item.ItemID.toLowerCase().includes(searchText.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => b.total - a.total);

  const groupedByRegion = regions.reduce((acc, region) => {
    const regionWarehouses = warehouseNames.filter(name => 
      name && name.trim() !== '' && data.some(row => row.WHName === name && row.WHRegion === region)
    );
    if (regionWarehouses.length > 0) {
      acc[region] = regionWarehouses;
    }
    return acc;
  }, {} as Record<string, string[]>);

  const handleItemClick = (item: PivotedItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleExport = () => {
    exportToExcel(
      filteredData,
      warehouseNames,
      {},
      groupedByRegion,
      'kauri-inventory-regional'
    );
  };

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
            <h3 className="text-lg font-semibold text-gray-900">Inventory by Region</h3>
            <p className="text-sm text-gray-500 mt-1">{filteredData.length} items • Click any row for warehouse details</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export to Excel
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          {companies.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Company:</label>
              <Select value={selectedCompany || ""} onValueChange={setSelectedCompany}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(company => (
                    <SelectItem key={company} value={company}>{company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search items..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 pr-4 py-2 w-64"
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
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white">
          <thead className="bg-gray-50 border-y border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Item ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Group
              </th>
              {regions.map(region => (
                <th key={region} className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[100px]">
                  {region}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider bg-yellow-50">
                Total
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map((item, index) => {
              const regionTotals = regions.reduce((acc, region) => {
                const regionWarehouses = groupedByRegion[region] || [];
                acc[region] = regionWarehouses.reduce((sum, wh) => sum + (item.quantities[wh] || 0), 0);
                return acc;
              }, {} as Record<string, number>);

              return (
                <tr key={`${item.ItemID}-${index}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {item.ItemID}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                    {item.Description}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`text-xs ${groupColors[item.GRP] || groupColors["Other"]}`}>
                      {item.GRP}
                    </Badge>
                  </td>
                  {regions.map(region => {
                    const total = regionTotals[region] || 0;
                    return (
                      <td key={region} className="px-4 py-3 text-center text-sm font-mono">
                        {total > 0 ? (
                          <span className="font-medium">{total.toLocaleString()}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center text-sm font-mono font-bold bg-yellow-50">
                    {(item.total || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleItemClick(item)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <DetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        itemData={selectedItem}
        regions={regions}
        warehousesByRegion={groupedByRegion}
      />
    </div>
  );
}