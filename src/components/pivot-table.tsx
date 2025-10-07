"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CustomTooltip } from "@/components/ui/custom-tooltip";
import { parseCSV, pivotData, getUniqueValues, getUniqueWarehouseNames, getUniqueCompanies, type InventoryRow, type PivotedItem } from "@/lib/csv-parser";
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
  const [warehouseNames, setWarehouseNames] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("Wine Barrels");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [headerScrollRef, setHeaderScrollRef] = useState<HTMLDivElement | null>(null);
  const [bodyScrollRef, setBodyScrollRef] = useState<HTMLDivElement | null>(null);

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
        
        // Determine which company to use for initial load
        let filteredData = parsed; // Default to all data
        
        if (availableCompanies.length > 0) {
          // Use "Kauri Australia (a Limited Partnership)" as default if available, otherwise use first available company
          const initialCompany = availableCompanies.includes("Kauri Australia (a Limited Partnership)") 
            ? "Kauri Australia (a Limited Partnership)" 
            : availableCompanies.includes("KALP") 
              ? "KALP" 
              : availableCompanies[0];
          setSelectedCompany(initialCompany);
          filteredData = parsed.filter(row => row.Company === initialCompany);
        } else {
          // No companies available, use all data and don't set a selected company
          setSelectedCompany("");
        }
          
        setPivotedData(pivotData(filteredData));
        setWarehouseNames(getUniqueWarehouseNames(filteredData));
        setRegions(getUniqueValues(filteredData, 'WHRegion'));
        const availableGroups = getUniqueValues(filteredData, 'GRP');
        setGroups(availableGroups);
        
        // Set default group to first available group if current selection doesn't exist
        if (availableGroups.length > 0 && !availableGroups.includes(selectedGroup)) {
          setSelectedGroup(availableGroups[0]);
        }
        
        // Initialize all columns as visible
        const initialVisibility = getUniqueWarehouseNames(filteredData).reduce((acc, name) => {
          acc[name] = true;
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

  // Update data when company filter changes
  useEffect(() => {
    if (data.length > 0 && companies.length > 0 && selectedCompany) {
      const filteredData = data.filter(row => row.Company === selectedCompany);
      setPivotedData(pivotData(filteredData));
      setWarehouseNames(getUniqueWarehouseNames(filteredData));
      setRegions(getUniqueValues(filteredData, 'WHRegion'));
      setGroups(getUniqueValues(filteredData, 'GRP'));
      
      // Reset column visibility for new data
      const initialVisibility = getUniqueWarehouseNames(filteredData).reduce((acc, name) => {
        acc[name] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setVisibleColumns(initialVisibility);
    }
  }, [selectedCompany, data, companies]);

  // Track container width for responsive column sizing
  useEffect(() => {
    const updateWidth = () => {
      const container = document.querySelector('.pivot-table-container');
      if (container) {
        setContainerWidth(container.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Sync scroll between header and body
  useEffect(() => {
    if (!headerScrollRef || !bodyScrollRef) return;

    const handleHeaderScroll = () => {
      bodyScrollRef.scrollLeft = headerScrollRef.scrollLeft;
    };

    const handleBodyScroll = () => {
      headerScrollRef.scrollLeft = bodyScrollRef.scrollLeft;
    };

    headerScrollRef.addEventListener('scroll', handleHeaderScroll);
    bodyScrollRef.addEventListener('scroll', handleBodyScroll);

    return () => {
      headerScrollRef.removeEventListener('scroll', handleHeaderScroll);
      bodyScrollRef.removeEventListener('scroll', handleBodyScroll);
    };
  }, [headerScrollRef, bodyScrollRef]);

  const filteredData = pivotedData
    .filter(item => {
      // Always filter by selected group (no "all" option)
      if (item.group !== selectedGroup) return false;
      if (searchText && !item.itemId.toLowerCase().includes(searchText.toLowerCase()) && 
          !item.itemDesc.toLowerCase().includes(searchText.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      // Sort by itemId since we're only showing one group
      return a.itemId.localeCompare(b.itemId);
    });

  // Filter out regions that have no data across all filtered items
  const activeRegions = regions.filter(region => {
    const regionWarehouses = warehouseNames.filter(whName => 
      data.some(row => row.WHName === whName && row.WHRegion === region)
    );
    // Check if this region has any data in the filtered items
    return filteredData.some(item => 
      regionWarehouses.some(whName => {
        const qty = item.quantities[whName] || 0;
        const onPO = item.quantitiesOnPO?.[whName] || 0;
        const onSO = item.quantitiesOnSO?.[whName] || 0;
        return qty > 0 || onPO > 0 || onSO > 0;
      })
    );
  });
  
  const visibleWarehouseNames = warehouseNames.filter(name => visibleColumns[name]);

  // Calculate optimal column widths based on available space
  const getOptimalColumnWidth = () => {
    if (containerWidth === 0) return 90; // Default width
    
    const fixedColumnsWidth = 580; // Item ID (140) + Description (300) + Group (140)
    const summaryColumnsWidth = 320; // 4 columns × 80px
    const availableWidth = containerWidth - fixedColumnsWidth - summaryColumnsWidth - 50; // 50px for margins/scrollbar
    const totalWarehouseColumns = visibleWarehouseNames.length;
    
    if (totalWarehouseColumns === 0) return 90;
    
    const optimalWidth = Math.max(90, Math.min(140, Math.floor(availableWidth / totalWarehouseColumns)));
    return optimalWidth;
  };

  const warehouseColumnWidth = getOptimalColumnWidth();

  // Fixed column widths for consistent layout
  const FIXED_COLUMNS = {
    itemId: 140,
    description: 300
  };
  
  // Summary column widths
  const SUMMARY_COLUMNS = {
    total: 320,
    individual: 80
  };

  const groupedByRegion = regions.reduce((acc, region) => {
    const regionWarehouses = visibleWarehouseNames.filter(name => 
      name && name.trim() !== '' && data.some(row => row.WHName === name && row.WHRegion === region)
    );
    if (regionWarehouses.length > 0) {
      acc[region] = regionWarehouses;
    }
    return acc;
  }, {} as Record<string, string[]>);

  const renderWarehouseColumns = (isHeader: boolean = false, item?: PivotedItem) => {
    return regions.map((region) => {
      const regionWarehouses = warehouseNames.filter(whName => 
        data.some(row => row.WHName === whName && row.WHRegion === region)
      );
      
      return (
        <div key={region} className="flex flex-col border-r border-gray-200 flex-shrink-0">
          {isHeader && (
            <div className="px-3 py-3 text-sm font-semibold text-center border-b border-gray-300 bg-slate-50 min-w-[100px]">
              {region}
            </div>
          )}
          <div className="flex bg-slate-50 min-w-[100px]">
            <div className="px-3 py-3 text-xs text-center border-r border-gray-100 whitespace-normal break-words w-full">
              {isHeader ? 'Qty On Hand' : (
                item ? (() => {
                  // Calculate regional totals from actual data
                  const regionOnHand = regionWarehouses.reduce((sum, whName) => {
                    return sum + (item.quantities[whName] || 0);
                  }, 0);
                  
                  const regionAvailable = regionWarehouses.reduce((sum, whName) => {
                    const onHand = item.quantities[whName] || 0;
                    const onSO = item.quantitiesOnSO?.[whName] || 0;
                    return sum + Math.max(0, onHand - onSO);
                  }, 0);
                  
                  // Color coding based on GLOBAL availability status
                  let colorClass = 'text-gray-400';
                  if (regionOnHand > 0) {
                    // Use global item availability for color coding, not regional
                    const globalOnHand = item.totalQty || 0;
                    const globalAvailable = item.qtyAvailable || 0;
                    
                    if (globalAvailable <= 0) {
                      colorClass = 'text-red-600 bg-red-50 font-medium'; // Red: Global shortage/oversold
                    } else if (globalAvailable >= globalOnHand) {
                      colorClass = 'text-green-600 bg-green-50 font-medium'; // Green: Fully available globally
                    } else {
                      const globalAvailabilityRatio = globalAvailable / globalOnHand;
                      if (globalAvailabilityRatio >= 0.7) {
                        colorClass = 'text-blue-600 bg-blue-50 font-medium'; // Blue: 70%+ available globally
                      } else if (globalAvailabilityRatio >= 0.3) {
                        colorClass = 'text-orange-600 bg-orange-50 font-medium'; // Orange: 30-70% available globally
                      } else {
                        colorClass = 'text-red-600 bg-red-50 font-medium'; // Red: <30% available globally
                      }
                    }
                  }
                  
                  return regionOnHand > 0 ? (
                    <CustomTooltip
                      content={
                        <div>
                          <div className="font-semibold mb-2 text-yellow-300">{region} Region</div>
                          <div className="mb-2 border-b border-gray-600 pb-2">
                            <div className="text-blue-300">Regional On Hand: <span className="text-white">{regionOnHand.toLocaleString()}</span></div>
                            <div className="text-green-300">Regional Available: <span className="text-white">{regionAvailable.toLocaleString()}</span></div>
                          </div>
                          <div className="mb-2">
                            <div className="text-xs text-gray-400 mb-1">Global Status:</div>
                            <div className="text-blue-300">Total On Hand: <span className="text-white">{(item.totalQty || 0).toLocaleString()}</span></div>
                            <div className="text-green-300">Total Available: <span className="text-white">{(item.qtyAvailable || 0).toLocaleString()}</span></div>
                            <div className="text-purple-300">Total Committed: <span className="text-white">{((item.totalQty || 0) - (item.qtyAvailable || 0)).toLocaleString()}</span></div>
                          </div>
                          {regionWarehouses.length > 0 && (
                            <div>
                              <div className="font-medium mb-1 text-blue-300">Warehouse Breakdown:</div>
                              <div className="space-y-1">
                                {regionWarehouses.map((whName) => {
                                  const onHand = item.quantities[whName] || 0;
                                  const onSO = item.quantitiesOnSO?.[whName] || 0;
                                  const available = Math.max(0, onHand - onSO);
                                  return onHand > 0 ? (
                                    <div key={whName} className="text-xs">
                                      <div className="text-gray-300">{whName}:</div>
                                      <div className="ml-2">
                                        <span className="text-blue-200">On Hand: {onHand.toLocaleString()}</span><br/>
                                        <span className="text-green-200">Available: {available.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      }
                    >
                      <span className={`hover:opacity-80 px-1 py-0.5 rounded inline-block cursor-pointer ${colorClass}`}>
                        {regionOnHand.toLocaleString()}
                      </span>
                    </CustomTooltip>
                  ) : (
                    <span className="text-gray-400">-</span>
                  );
                })() : '-'
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  const handleExport = () => {
    exportToExcel(
      filteredData,
      warehouseNames,
      visibleColumns,
      groupedByRegion,
      'kauri-inventory'
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

  // Get the current group color for header
  const getGroupColor = (group: string) => {
    return groupColors[group] || groupColors["Other"];
  };

  return (
    <div className="w-full pivot-table-container max-w-none">
      {/* Filters - moved above title */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Group Filter - Primary filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Product Group:</label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-48 min-w-[192px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {groups.map(group => (
                  <SelectItem key={group} value={group}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getGroupColor(group)}`}></div>
                      {group}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Company Filter - only show if companies are available */}
          {companies.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Company:</label>
              <Select value={selectedCompany || ""} onValueChange={setSelectedCompany}>
                <SelectTrigger className="w-72 min-w-[288px]">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(company => (
                    <SelectItem key={company} value={company}>
                      <span className="truncate max-w-[250px]" title={company}>
                        {company}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search items..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 w-48 min-w-[192px] text-sm"
            />
          </div>
        </div>
      </div>

      {/* Group Header - Prominent display */}
      <div className={`px-6 py-4 border-b ${getGroupColor(selectedGroup)} border-l-4 border-l-logo-green`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">{selectedGroup}</h2>
            <div className="text-sm opacity-80">
              {filteredData.length} items in this category
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export to Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Pivot Table */}
      <div className="overflow-x-auto border border-gray-300 max-h-[80vh]">
        <table className="w-full border-collapse" style={{ fontSize: '11px' }}>
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-100">
              <th rowSpan={2} className="border border-gray-300 px-2 py-2 text-left font-semibold text-gray-700" style={{ width: '140px' }}>
                Item ID
              </th>
              <th rowSpan={2} className="border border-gray-300 px-2 py-2 text-left font-semibold text-gray-700" style={{ width: '300px' }}>
                Description
              </th>
              <th colSpan={4} className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700" style={{ backgroundColor: '#F8F9FA' }}>
                Summary
              </th>
              {activeRegions.map((region) => {
                const regionWarehouses = warehouseNames.filter(whName => 
                  data.some(row => row.WHName === whName && row.WHRegion === region)
                );
                return (
                  <th key={region} rowSpan={2} className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700" style={{ backgroundColor: '#F8FAFC' }}>
                    {region}<br/>
                    <span className="text-xs font-normal">Qty Available</span>
                  </th>
                );
              })}
            </tr>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700" style={{ width: '80px', backgroundColor: '#F0FDF4' }}>
                Total Qty on Hand
              </th>
              <th className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700" style={{ width: '80px', backgroundColor: '#E0F2FE' }}>
                Qty on PO
              </th>
              <th className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700" style={{ width: '80px', backgroundColor: '#FEF3C7' }}>
                Qty on SO
              </th>
              <th className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700" style={{ width: '80px', backgroundColor: '#E0F2FE' }}>
                Qty Available
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Group items by ClipBd */}
            {(() => {
              // Group filtered data by ClipBd
              const groupedByClipBd = new Map<string, typeof filteredData>();
              
              filteredData.forEach(item => {
                // Get ClipBd from first matching data row
                const clipBd = data.find(row => row.ITEMID === item.itemId)?.ClipBd || 'Other';
                if (!groupedByClipBd.has(clipBd)) {
                  groupedByClipBd.set(clipBd, []);
                }
                groupedByClipBd.get(clipBd)!.push(item);
              });

              // Sort groups by ClipBd name
              const sortedGroups = Array.from(groupedByClipBd.entries()).sort((a, b) => a[0].localeCompare(b[0]));

              return sortedGroups.map(([clipBd, items]) => [
                // ClipBd header row
                <tr key={`clipbd-${clipBd}`} style={{ backgroundColor: '#FED7AA' }}>
                  <td colSpan={2 + 4 + activeRegions.length} className="border border-gray-300 px-3 py-1 font-bold">
                    {clipBd}
                  </td>
                </tr>,
                // Items in this ClipBd group
                ...items.map((item, index) => {
                  const globalOnHand = item.totalQty || 0;
                  const globalAvailable = item.qtyAvailable || 0;
                  
                  // Global color coding logic for consistency
                  const getAvailabilityColorClass = () => {
                    if (globalOnHand === 0) return 'text-gray-400';
                    
                    if (globalAvailable <= 0) {
                      return 'text-red-600 bg-red-50 font-medium';
                    } else if (globalAvailable >= globalOnHand) {
                      return 'text-green-600 bg-green-50 font-medium';
                    } else {
                      const ratio = globalAvailable / globalOnHand;
                      if (ratio >= 0.7) {
                        return 'text-blue-600 bg-blue-50 font-medium';
                      } else if (ratio >= 0.3) {
                        return 'text-orange-600 bg-orange-50 font-medium';
                      } else {
                        return 'text-red-600 bg-red-50 font-medium';
                      }
                    }
                  };

                  return (
                    <tr key={`${clipBd}-${item.itemId}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {/* Item ID */}
                      <td className="border-l border-r border-b border-gray-200 px-2 py-1">
                        {item.itemId}
                      </td>
                      
                      {/* Description */}
                      <td className="border-r border-b border-gray-200 px-2 py-1">
                        <div className="truncate" title={item.itemDesc}>
                          {item.itemDesc}
                        </div>
                      </td>
                      
                      {/* Total Qty on Hand with tooltip */}
                      <td className="border-r border-b border-gray-200 px-1 py-1 text-center">
                        {item.totalQty > 0 ? (
                          <div className="relative group">
                            <span className={`px-2 py-1 rounded cursor-pointer hover:opacity-80 ${item.totalQty > 0 ? 'bg-green-50 text-green-700' : 'text-gray-400'}`}>
                              {item.totalQty.toLocaleString()}
                            </span>
                            <div className="absolute right-0 top-6 w-80 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                              <div className="font-semibold mb-2 text-yellow-300">Total Qty on Hand Breakdown</div>
                              <div className="mb-2 border-b border-gray-700 pb-2">
                                <div className="text-blue-300">Total On Hand: <span className="text-white font-bold">{item.totalQty.toLocaleString()}</span></div>
                              </div>
                              <div className="font-medium mb-1 text-blue-300">Warehouse Breakdown:</div>
                              <div className="space-y-1">
                                {Object.entries(item.quantities || {})
                                  .filter(([, qty]) => qty > 0)
                                  .map(([warehouse, qty]) => (
                                    <div key={warehouse} className="flex justify-between gap-3">
                                      <span className="text-gray-300">{warehouse}:</span>
                                      <span className="text-white">{qty.toLocaleString()}</span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      
                      {/* Qty on PO with detailed tooltip */}
                      <td className="border-r border-b border-gray-200 px-1 py-1 text-center">
                        {item.totalQtyOnPO > 0 ? (
                          <div className="relative group">
                            <span className="px-2 py-1 rounded cursor-pointer hover:opacity-80 bg-blue-50 text-blue-700">
                              {item.totalQtyOnPO.toLocaleString()}
                            </span>
                            <div className="absolute right-0 top-6 w-80 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                              <div className="font-semibold mb-2 text-yellow-300">Qty on PO Breakdown</div>
                              <div className="mb-2 border-b border-gray-700 pb-2">
                                <div className="text-green-300">Total On PO: <span className="text-white font-bold">+{item.totalQtyOnPO.toLocaleString()}</span></div>
                              </div>
                              <div className="font-medium mb-1 text-blue-300">Warehouse Breakdown:</div>
                              <div className="space-y-1">
                                {Object.entries(item.quantitiesOnPO || {})
                                  .filter(([, qty]) => qty > 0)
                                  .map(([warehouse, qty]) => (
                                    <div key={warehouse} className="flex justify-between gap-3">
                                      <span className="text-gray-300">{warehouse}:</span>
                                      <span className="text-green-100">+{qty.toLocaleString()}</span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      
                      {/* Qty on SO with detailed tooltip */}
                      <td className="border-r border-b border-gray-200 px-1 py-1 text-center">
                        {Math.abs(item.totalQtyOnSO || 0) > 0 ? (
                          <div className="relative group">
                            <span className="px-2 py-1 rounded cursor-pointer hover:opacity-80 bg-orange-50 text-orange-700">
                              {Math.abs(item.totalQtyOnSO || 0).toLocaleString()}
                            </span>
                            <div className="absolute right-0 top-6 w-80 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                              <div className="font-semibold mb-2 text-yellow-300">Qty on SO Breakdown</div>
                              <div className="mb-2 border-b border-gray-700 pb-2">
                                <div className="text-red-300">Total On SO: <span className="text-white font-bold">{Math.abs(item.totalQtyOnSO || 0).toLocaleString()}</span></div>
                              </div>
                              <div className="font-medium mb-1 text-blue-300">Warehouse Breakdown:</div>
                              <div className="space-y-1">
                                {Object.entries(item.quantitiesOnSO || {})
                                  .filter(([, qty]) => Math.abs(qty) > 0)
                                  .map(([warehouse, qty]) => (
                                    <div key={warehouse} className="flex justify-between gap-3">
                                      <span className="text-gray-300">{warehouse}:</span>
                                      <span className="text-red-100">{Math.abs(qty).toLocaleString()}</span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="relative group">
                            <span className="text-gray-400 cursor-pointer">-</span>
                            <div className="absolute right-0 top-6 w-80 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                              <div className="font-semibold mb-2 text-yellow-300">Qty on SO Breakdown</div>
                              <div className="mb-2 border-b border-gray-700 pb-2">
                                <div className="text-red-300">Total On SO: <span className="text-white font-bold">0</span></div>
                              </div>
                              <div className="font-medium mb-1 text-blue-300">No sales orders for this item</div>
                            </div>
                          </div>
                        )}
                      </td>
                      
                      {/* Qty Available with color-coded tooltip */}
                      <td className="border-r border-b border-gray-200 px-1 py-1 text-center">
                        <div className="relative group">
                          <span className={`px-2 py-1 rounded cursor-pointer hover:opacity-80 ${getAvailabilityColorClass()}`}>
                            {item.qtyAvailable.toLocaleString()}
                          </span>
                          <div className="absolute right-0 top-6 w-96 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div className="font-semibold mb-2 text-yellow-300">Qty Available Breakdown</div>
                            <div className="mb-2 border-b border-gray-700 pb-2">
                              <div className="text-blue-300">On Hand: <span className="text-white">{item.totalQty.toLocaleString()}</span></div>
                              <div className="text-green-300">On PO: <span className="text-white">+{item.totalQtyOnPO.toLocaleString()}</span></div>
                              <div className="text-red-300">On SO: <span className="text-white">-{item.totalQtyOnSO.toLocaleString()}</span></div>
                              <div className="text-yellow-300 font-bold mt-1 pt-1 border-t border-gray-700">Available: <span className="text-white">{item.qtyAvailable.toLocaleString()}</span></div>
                            </div>
                            <div className="font-medium mb-1 text-blue-300">Warehouse Breakdown:</div>
                            <div className="space-y-2">
                              {Object.entries(item.quantities || {})
                                .filter(([, qty]) => qty > 0)
                                .map(([warehouse, qty]) => {
                                  const onPO = item.quantitiesOnPO?.[warehouse] || 0;
                                  const onSO = item.quantitiesOnSO?.[warehouse] || 0;
                                  const available = Math.max(0, qty + onPO - onSO);
                                  
                                  // Individual warehouse color coding
                                  let warehouseColor = 'text-gray-400';
                                  if (qty > 0) {
                                    if (available <= 0) {
                                      warehouseColor = 'text-red-400 font-bold';
                                    } else if (available >= qty) {
                                      warehouseColor = 'text-green-400 font-bold';
                                    } else {
                                      const ratio = available / qty;
                                      if (ratio >= 0.7) {
                                        warehouseColor = 'text-blue-400 font-bold';
                                      } else if (ratio >= 0.3) {
                                        warehouseColor = 'text-orange-400 font-bold';
                                      } else {
                                        warehouseColor = 'text-red-400 font-bold';
                                      }
                                    }
                                  }
                                  
                                  return (
                                    <div key={warehouse} className="ml-2 p-1 rounded bg-gray-800">
                                      <div className="font-medium text-gray-200 mb-1">{warehouse}</div>
                                      <div className="ml-2 space-y-0.5">
                                        <div className="flex justify-between">
                                          <span className="text-yellow-200">On Hand:</span>
                                          <span className="text-yellow-100 font-medium">{qty.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-green-300">On PO:</span>
                                          <span className={onPO > 0 ? "text-green-100 font-medium" : "text-gray-500"}>+{onPO.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-red-300">On SO:</span>
                                          <span className={onSO > 0 ? "text-red-100 font-medium" : "text-gray-500"}>-{onSO.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between pt-0.5 border-t border-gray-700">
                                          <span className="text-gray-300">Available:</span>
                                          <span className={warehouseColor}>{available.toLocaleString()}</span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Regional columns - showing qty available */}
                      {activeRegions.map(region => {
                        const regionWarehouses = warehouseNames.filter(whName => 
                          data.some(row => row.WHName === whName && row.WHRegion === region)
                        );
                        const regionOnHand = regionWarehouses.reduce((sum, whName) => {
                          return sum + (item.quantities[whName] || 0);
                        }, 0);
                        const regionOnPO = regionWarehouses.reduce((sum, whName) => {
                          return sum + (item.quantitiesOnPO?.[whName] || 0);
                        }, 0);
                        const regionOnSO = regionWarehouses.reduce((sum, whName) => {
                          return sum + (item.quantitiesOnSO?.[whName] || 0);
                        }, 0);
                        const regionAvailable = Math.max(0, regionOnHand + regionOnPO - regionOnSO);
                        
                        return (
                          <td key={region} className="border-r border-b border-gray-200 px-1 py-1 text-center">
                            {regionAvailable > 0 || regionOnHand > 0 ? (
                              <div className="relative group">
                                <span className={`px-2 py-1 rounded cursor-pointer hover:opacity-80 ${getAvailabilityColorClass()}`}>
                                  {regionAvailable.toLocaleString()}
                                </span>
                                <div className="absolute right-0 top-6 w-80 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                  <div className="font-semibold mb-2 text-yellow-300">{region} Region Available</div>
                                  <div className="mb-2 border-b border-gray-600 pb-2">
                                    <div className="text-blue-300">Regional On Hand: <span className="text-white">{regionOnHand.toLocaleString()}</span></div>
                                    <div className="text-green-300">Regional On PO: <span className="text-white">+{regionOnPO.toLocaleString()}</span></div>
                                    <div className="text-red-300">Regional On SO: <span className="text-white">-{regionOnSO.toLocaleString()}</span></div>
                                    <div className="text-yellow-300 font-bold mt-1 pt-1 border-t border-gray-700">Regional Available: <span className="text-white">{regionAvailable.toLocaleString()}</span></div>
                                  </div>
                                  <div className="font-medium mb-1 text-blue-300">Warehouse Breakdown:</div>
                                  <div className="space-y-1">
                                    {regionWarehouses.map((whName) => {
                                      const qty = item.quantities[whName] || 0;
                                      const onPO = item.quantitiesOnPO?.[whName] || 0;
                                      const onSO = item.quantitiesOnSO?.[whName] || 0;
                                      const available = Math.max(0, qty + onPO - onSO);
                                      
                                      // Individual warehouse color coding
                                      let warehouseColor = 'text-gray-400';
                                      if (qty > 0) {
                                        if (available <= 0) {
                                          warehouseColor = 'text-red-400 font-bold';
                                        } else if (available >= qty) {
                                          warehouseColor = 'text-green-400 font-bold';
                                        } else {
                                          const ratio = available / qty;
                                          if (ratio >= 0.7) {
                                            warehouseColor = 'text-blue-400 font-bold';
                                          } else if (ratio >= 0.3) {
                                            warehouseColor = 'text-orange-400 font-bold';
                                          } else {
                                            warehouseColor = 'text-red-400 font-bold';
                                          }
                                        }
                                      }
                                      
                                      return (qty > 0 || onPO > 0 || onSO > 0) ? (
                                        <div key={whName} className="ml-2 p-1 rounded bg-gray-800">
                                          <div className="font-medium text-gray-200 mb-1">{whName}</div>
                                          <div className="ml-2 space-y-0.5">
                                            <div className="flex justify-between">
                                              <span className="text-yellow-200">On Hand:</span>
                                              <span className="text-yellow-100 font-medium">{qty.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-green-300">On PO:</span>
                                              <span className={onPO > 0 ? "text-green-100 font-medium" : "text-gray-500"}>+{onPO.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-red-300">On SO:</span>
                                              <span className={onSO > 0 ? "text-red-100 font-medium" : "text-gray-500"}>-{onSO.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between pt-0.5 border-t border-gray-700">
                                              <span className="text-gray-300">Available:</span>
                                              <span className={warehouseColor}>{available.toLocaleString()}</span>
                                            </div>
                                          </div>
                                        </div>
                                      ) : null;
                                    })}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ]).flat();
            })()}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Showing {filteredData.length} items</span>
          <div className="flex items-center gap-4">
            <span>Total Items: <strong>{pivotedData.length}</strong></span>
            <span>Regions: <strong>{activeRegions.length}</strong></span>
            <span>Warehouses: <strong>{warehouseNames.length}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}