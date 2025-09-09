"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ColumnVisibility } from "@/components/column-visibility";
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
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
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
        const response = await fetch('/Availability.csv');
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
          // Use KALP if available, otherwise use first available company
          const initialCompany = availableCompanies.includes("KALP") ? "KALP" : availableCompanies[0];
          setSelectedCompany(initialCompany);
          filteredData = parsed.filter(row => row.Company === initialCompany);
        } else {
          // No companies available, use all data and don't set a selected company
          setSelectedCompany("");
        }
          
        setPivotedData(pivotData(filteredData));
        setWarehouseNames(getUniqueWarehouseNames(filteredData));
        setRegions(getUniqueValues(filteredData, 'WHRegion'));
        setGroups(getUniqueValues(filteredData, 'GRP'));
        
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
      if (selectedGroup !== "all" && item.group !== selectedGroup) return false;
      if (searchText && !item.itemId.toLowerCase().includes(searchText.toLowerCase()) && 
          !item.itemDesc.toLowerCase().includes(searchText.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      // Sort by group first, then by itemId
      if (a.group !== b.group) {
        return a.group.localeCompare(b.group);
      }
      return a.itemId.localeCompare(b.itemId);
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

  // BULLETPROOF ALIGNMENT: Single immutable width calculation
  const getColumnLayout = () => {
    // Fixed column widths - NEVER CHANGE THESE
    const FIXED_COLUMNS = {
      itemId: 140,
      description: 300, 
      group: 140
    };
    
    // Summary column widths - NEVER CHANGE THESE
    const SUMMARY_COLUMNS = {
      total: 320,
      individual: 80
    };

    // Calculate warehouse region layouts with IMMUTABLE logic
    const warehouseRegions = Object.entries(groupedByRegion).map(([region, warehouses]) => {
      // IMMUTABLE: Region width calculation
      const regionTextWidth = region.length * 8;
      const minWarehouseWidth = warehouses.length * warehouseColumnWidth;
      const regionTotalWidth = Math.max(regionTextWidth, minWarehouseWidth);
      
      // IMMUTABLE: Each warehouse gets EXACTLY the same width
      const warehouseWidth = regionTotalWidth / warehouses.length;

      return {
        region,
        totalWidth: regionTotalWidth,
        warehouses: warehouses.map(warehouse => ({
          name: warehouse,
          width: warehouseWidth // EXACTLY the same for all warehouses in this region
        }))
      };
    });

    return {
      fixedColumns: FIXED_COLUMNS,
      summaryColumns: SUMMARY_COLUMNS,
      warehouseRegions
    };
  };

  const groupedByRegion = regions.reduce((acc, region) => {
    const regionWarehouses = visibleWarehouseNames.filter(name => 
      name && name.trim() !== '' && data.some(row => row.WH_Name === name && row.WHRegion === region)
    );
    if (regionWarehouses.length > 0) {
      acc[region] = regionWarehouses;
    }
    return acc;
  }, {} as Record<string, string[]>);

  const columnLayout = getColumnLayout();

  // BULLETPROOF: Shared rendering function that ensures identical widths
  const renderWarehouseColumns = (isHeader: boolean = false, item?: PivotedItem) => {
    return columnLayout.warehouseRegions.map(({ region, totalWidth, warehouses }) => (
      <div key={region} className="flex flex-col border-r border-gray-200 flex-shrink-0">
        {isHeader && (
          <div 
            className="px-2 py-2 text-sm font-semibold text-center border-b border-gray-300 bg-slate-50" 
            style={{ 
              minWidth: `${totalWidth}px`,
              width: `${totalWidth}px`
            }}
          >
            {region}
          </div>
        )}
        <div 
          className="flex bg-slate-50" 
          style={{ 
            minWidth: `${totalWidth}px`,
            width: `${totalWidth}px`
          }}
        >
          {warehouses.map(({ name, width }) => (
            <div 
              key={name} 
              className="px-1 py-2 text-xs text-center border-r border-gray-100 whitespace-normal break-words" 
              style={{ 
                minWidth: `${width}px`, 
                width: `${width}px`
              }}
            >
              {isHeader ? name : (
                item ? (() => {
                  const quantity = item.quantities[name] || 0;
                  const lots = item.lotDetails[name] || [];
                  
                  return quantity > 0 ? (
                    lots.length > 0 ? (
                      <CustomTooltip
                        content={
                          <div>
                            <div className="font-semibold mb-2 text-yellow-300">{name}</div>
                            <div className="font-medium mb-1 text-blue-300">Lot Details:</div>
                            <div className="space-y-1">
                              {lots.map((lot, idx: number) => (
                                <div key={idx} className="flex justify-between gap-3">
                                  <span className="text-gray-300">{lot.lotId}:</span>
                                  <span className="font-medium">{lot.qty.toLocaleString()} units</span>
                                </div>
                              ))}
                            </div>
                            {lots[0]?.firstDate && (
                              <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400">
                                First: {lots[0].firstDate}
                              </div>
                            )}
                          </div>
                        }
                      >
                        <span className="hover:bg-blue-50 px-1 py-0.5 rounded inline-block">
                          {quantity.toLocaleString()}
                        </span>
                      </CustomTooltip>
                    ) : (
                      <span>{quantity.toLocaleString()}</span>
                    )
                  ) : (
                    <span className="text-gray-400">-</span>
                  );
                })() : '-'
              )}
            </div>
          ))}
        </div>
      </div>
    ));
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

  return (
    <div className="w-full pivot-table-container max-w-none">
      {/* Header with Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Inventory Availability by Location</h3>
            <p className="text-sm text-gray-500 mt-1">{filteredData.length} items • Grouped by region and warehouse</p>
          </div>
          <div className="flex items-center gap-3">
            <ColumnVisibility
              columns={warehouseNames}
              visibleColumns={visibleColumns}
              onToggle={(column) => setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }))}
              onToggleAll={(visible) => {
                const newState = warehouseNames.reduce((acc, name) => {
                  acc[name] = visible;
                  return acc;
                }, {} as Record<string, boolean>);
                setVisibleColumns(newState);
              }}
              onToggleRegion={(region, visible) => {
                const regionWarehouses = groupedByRegion[region] || [];
                setVisibleColumns(prev => {
                  const newState = { ...prev };
                  regionWarehouses.forEach(warehouse => {
                    newState[warehouse] = visible;
                  });
                  return newState;
                });
              }}
              groupedByRegion={groupedByRegion}
            />
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export to Excel
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Company Filter - only show if companies are available */}
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
        </div>
      </div>

      {/* Pivot Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden w-full">
        {/* Scrollable Header - syncs with body */}
        <div className="bg-slate-50 border-b border-gray-200 sticky top-0 z-20">
          <div 
            className="overflow-x-auto"
            ref={setHeaderScrollRef}
          >
            <div className="flex min-w-full">
            {/* Fixed columns - using single source of truth */}
            <div className="flex bg-slate-50 border-r border-gray-200 flex-shrink-0">
              <div className="px-3 py-2 text-sm font-medium border-r border-gray-200" style={{ minWidth: `${columnLayout.fixedColumns.itemId}px`, width: `${columnLayout.fixedColumns.itemId}px` }}>Item ID</div>
              <div className="px-3 py-2 text-sm font-medium border-r border-gray-200" style={{ minWidth: `${columnLayout.fixedColumns.description}px`, width: `${columnLayout.fixedColumns.description}px` }}>Description</div>
              <div className="px-3 py-2 text-sm font-medium border-r border-gray-200" style={{ minWidth: `${columnLayout.fixedColumns.group}px`, width: `${columnLayout.fixedColumns.group}px` }}>Group</div>
            </div>
            
             {/* Summary columns - using single source of truth */}
             <div className="flex flex-col flex-shrink-0 border-r border-gray-300" style={{ minWidth: `${columnLayout.summaryColumns.total}px` }}>
               <div className="px-2 py-2 text-sm font-semibold text-center border-b border-gray-300 bg-slate-50" style={{ minWidth: `${columnLayout.summaryColumns.total}px` }}>
                 Summary
               </div>
               <div className="flex bg-slate-50">
                 <div className="px-2 py-2 text-xs font-medium text-center border-r border-gray-200" style={{ minWidth: `${columnLayout.summaryColumns.individual}px`, width: `${columnLayout.summaryColumns.individual}px` }}>Total Qty on Hand</div>
                 <div className="px-2 py-2 text-xs font-medium text-center border-r border-gray-200" style={{ minWidth: `${columnLayout.summaryColumns.individual}px`, width: `${columnLayout.summaryColumns.individual}px` }}>Qty on PO</div>
                 <div className="px-2 py-2 text-xs font-medium text-center border-r border-gray-200" style={{ minWidth: `${columnLayout.summaryColumns.individual}px`, width: `${columnLayout.summaryColumns.individual}px` }}>Qty on SO</div>
                 <div className="px-2 py-2 text-xs font-medium text-center" style={{ minWidth: `${columnLayout.summaryColumns.individual}px`, width: `${columnLayout.summaryColumns.individual}px` }}>Qty Available</div>
               </div>
             </div>
            
             {/* Warehouse columns - BULLETPROOF ALIGNMENT */}
             {renderWarehouseColumns(true)}
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div 
          className="overflow-x-auto max-h-[60vh]" 
          style={{scrollbarGutter: 'stable'}}
          ref={setBodyScrollRef}
        >
          <div className="min-w-full">
            {filteredData.map((item, index) => {
              const isFirstInGroup = index === 0 || filteredData[index - 1].group !== item.group;
              
              return (
                <React.Fragment key={`${item.itemId}-${index}`}>
                  {isFirstInGroup && (
                    <div className={`border-t-2 border-gray-300 flex border-b border-gray-100 ${groupColors[item.group as keyof typeof groupColors] || "bg-gray-100"}`}>
                      {/* Fixed columns - using single source of truth */}
                      <div className="flex border-r border-gray-200 flex-shrink-0">
                        <div className="px-3 py-2 text-sm font-medium border-r border-gray-200" style={{ minWidth: `${columnLayout.fixedColumns.itemId}px`, width: `${columnLayout.fixedColumns.itemId}px` }}>
                          <span className="font-bold">{item.group}</span>
                        </div>
                        <div className="px-3 py-2 text-sm border-r border-gray-200" style={{ minWidth: `${columnLayout.fixedColumns.description}px`, width: `${columnLayout.fixedColumns.description}px` }}>
                          <span className="text-xs opacity-75">
                            ({filteredData.filter(i => i.group === item.group).length} items)
                          </span>
                        </div>
                        <div className="px-3 py-2 border-r border-gray-200" style={{ minWidth: `${columnLayout.fixedColumns.group}px`, width: `${columnLayout.fixedColumns.group}px` }}></div>
                      </div>
                      
                      {/* Summary columns - using single source of truth */}
                      <div className="flex flex-shrink-0 border-r border-gray-300" style={{ minWidth: `${columnLayout.summaryColumns.total}px` }}>
                        <div className="px-2 py-2 text-sm text-right font-semibold border-r border-gray-200" style={{ minWidth: `${columnLayout.summaryColumns.individual}px`, width: `${columnLayout.summaryColumns.individual}px` }}></div>
                        <div className="px-2 py-2 text-sm text-right border-r border-gray-200" style={{ minWidth: `${columnLayout.summaryColumns.individual}px`, width: `${columnLayout.summaryColumns.individual}px` }}></div>
                        <div className="px-2 py-2 text-sm text-right border-r border-gray-200" style={{ minWidth: `${columnLayout.summaryColumns.individual}px`, width: `${columnLayout.summaryColumns.individual}px` }}></div>
                        <div className="px-2 py-2 text-sm text-right font-semibold" style={{ minWidth: `${columnLayout.summaryColumns.individual}px`, width: `${columnLayout.summaryColumns.individual}px` }}></div>
                      </div>
                      
                      {/* Warehouse columns - BULLETPROOF ALIGNMENT */}
                      {renderWarehouseColumns(false)}
                    </div>
                  )}
                  
                  <div className="flex hover:bg-gray-50 border-b border-gray-100 min-w-full">
                    {/* Fixed columns - using single source of truth */}
                    <div className="flex bg-white border-r border-gray-200 flex-shrink-0">
                      <div className="px-3 py-2 text-sm font-medium border-r border-gray-200" style={{ minWidth: `${columnLayout.fixedColumns.itemId}px`, width: `${columnLayout.fixedColumns.itemId}px` }}>
                        {item.itemId}
                      </div>
                      <div className="px-3 py-2 text-sm border-r border-gray-200" style={{ minWidth: `${columnLayout.fixedColumns.description}px`, width: `${columnLayout.fixedColumns.description}px` }}>
                        <div className="truncate" title={item.itemDesc}>
                          {item.itemDesc}
                        </div>
                      </div>
                      <div className="px-3 py-2 border-r border-gray-200" style={{ minWidth: `${columnLayout.fixedColumns.group}px`, width: `${columnLayout.fixedColumns.group}px` }}>
                        <Badge className={`text-xs px-2 py-1 rounded-md font-medium border ${groupColors[item.group as keyof typeof groupColors] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
                          {item.group}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Summary columns - using single source of truth */}
                    <div className="flex flex-shrink-0 border-r border-gray-300" style={{ minWidth: `${columnLayout.summaryColumns.total}px` }}>
                      <div className="px-2 py-2 text-sm text-right font-semibold border-r border-gray-200" style={{ minWidth: `${columnLayout.summaryColumns.individual}px`, width: `${columnLayout.summaryColumns.individual}px` }}>{item.totalQty.toLocaleString()}</div>
                      <div className="px-2 py-2 text-sm text-right border-r border-gray-200" style={{ minWidth: `${columnLayout.summaryColumns.individual}px`, width: `${columnLayout.summaryColumns.individual}px` }}>
                        {item.totalQtyOnPO !== 0 ? (
                          <CustomTooltip
                            content={
                              <div>
                                <div className="font-semibold mb-2 text-yellow-300">Purchase Orders by Warehouse</div>
                                <div className="space-y-1">
                                  {Object.entries(item.quantitiesOnPO || {})
                                    .filter(([, qty]) => qty !== 0)
                                    .map(([warehouse, qty]) => (
                                      <div key={warehouse} className="flex justify-between gap-3">
                                        <span className="text-gray-300">{warehouse}:</span>
                                        <span className="font-medium">{qty.toLocaleString()}</span>
                                      </div>
                                    ))}
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-700 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Total:</span>
                                    <span className="font-bold text-green-300">{item.totalQtyOnPO.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            }
                          >
                            <span className="hover:bg-green-50 px-1 py-0.5 rounded inline-block cursor-help">
                              {item.totalQtyOnPO.toLocaleString()}
                            </span>
                          </CustomTooltip>
                        ) : (
                          <span>{item.totalQtyOnPO.toLocaleString()}</span>
                        )}
                      </div>
                      <div className="px-2 py-2 text-sm text-right border-r border-gray-200" style={{ minWidth: `${columnLayout.summaryColumns.individual}px`, width: `${columnLayout.summaryColumns.individual}px` }}>
                        {item.totalQtyOnSO !== 0 ? (
                          <CustomTooltip
                            content={
                              <div>
                                <div className="font-semibold mb-2 text-yellow-300">Sales Orders by Warehouse</div>
                                <div className="space-y-1">
                                  {Object.entries(item.quantitiesOnSO || {})
                                    .filter(([, qty]) => qty !== 0)
                                    .map(([warehouse, qty]) => (
                                      <div key={warehouse} className="flex justify-between gap-3">
                                        <span className="text-gray-300">{warehouse}:</span>
                                        <span className="font-medium">{qty.toLocaleString()}</span>
                                      </div>
                                    ))}
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-700 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Total:</span>
                                    <span className="font-bold text-red-300">{item.totalQtyOnSO.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            }
                          >
                            <span className="hover:bg-red-50 px-1 py-0.5 rounded inline-block cursor-help">
                              {item.totalQtyOnSO.toLocaleString()}
                            </span>
                          </CustomTooltip>
                        ) : (
                          <span>{item.totalQtyOnSO.toLocaleString()}</span>
                        )}
                      </div>
                      <div className={`px-2 py-2 text-sm text-right font-semibold ${item.qtyAvailable < 0 ? 'text-red-600' : 'text-green-700'}`} style={{ minWidth: `${columnLayout.summaryColumns.individual}px`, width: `${columnLayout.summaryColumns.individual}px` }}>{item.qtyAvailable.toLocaleString()}</div>
                    </div>
                    
                     {/* Warehouse columns - BULLETPROOF ALIGNMENT */}
                     {renderWarehouseColumns(false, item)}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Showing {filteredData.length} items</span>
          <div className="flex items-center gap-4">
            <span>Total Items: <strong>{pivotedData.length}</strong></span>
            <span>Regions: <strong>{regions.length}</strong></span>
            <span>Warehouses: <strong>{warehouseNames.length}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}