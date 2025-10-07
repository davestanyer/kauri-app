"use client";

import { useEffect, useState } from "react";

interface WebportalItem {
  KAURIITEMCODE: string;
  BRAND: string;
  SHORTDESCRIPTION: string;
  SIZE: string;
  SEASONING: string;
  GRAIN: string;
  OAK: string;
  TOASTING: string;
  BENDING: string;
  CURRENTLYAVAILABLE: string;
  FULLDESCRIPTION: string;
  STANDARDPRICETOCUSTOMERAUS: string;
  STANDARDPRICETOCUSTOMERNZ: string;
  CURRENCY: string;
}

interface InventoryItem {
  id: string;
  sa013: number;
  sa021: number;
  sa015: number;
  other: number;
}

// Generate mock inventory data for demo purposes
const generateMockInventory = (itemCode: string): InventoryItem => {
  const seed = parseInt(itemCode) || 0;
  const hasStock = Math.random() > 0.3; // 70% chance of having stock
  
  if (!hasStock) {
    return { id: itemCode, sa013: 0, sa021: 0, sa015: 0, other: 0 };
  }
  
  return {
    id: itemCode,
    sa013: seed % 17 === 0 ? Math.floor(Math.random() * 50) : 0,
    sa021: seed % 13 === 0 ? Math.floor(Math.random() * 40) : 0,
    sa015: seed % 19 === 0 ? Math.floor(Math.random() * 30) : 0,
    other: seed % 11 === 0 ? Math.floor(Math.random() * 20) : 0,
  };
};

export function BarrelAvailability() {
  const [webportalData, setWebportalData] = useState<WebportalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hideUnavailable, setHideUnavailable] = useState(true); // Default to hiding unavailable items
  const [selectedCompany, setSelectedCompany] = useState<string>("Kauri Australia (a Limited Partnership)"); // Add company filter

  useEffect(() => {
    const loadWebportalData = async () => {
      try {
        const response = await fetch("/Webportal.csv");
        const text = await response.text();
        
        // Parse CSV
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const data = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = [];
            let currentValue = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                values.push(currentValue.trim());
                currentValue = '';
              } else {
                currentValue += char;
              }
            }
            values.push(currentValue.trim());
            
            const item: Record<string, string> = {};
            headers.forEach((header, index) => {
              item[header] = values[index] || '';
            });
            
            return item as WebportalItem;
          })
          .filter(item => item.CURRENTLYAVAILABLE === 'Y');
        
        setWebportalData(data);
      } catch (error) {
        console.error("Failed to load webportal data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadWebportalData();
  }, []);

  const getGroupedData = () => {
    const grouped = new Map<string, WebportalItem[]>();
    
    // Filter by company first (simulate company filtering since webportal data is mock)
    const filteredData = selectedCompany === "All" 
      ? webportalData 
      : webportalData.filter((item, index) => {
          // Simulate company distribution - distribute items across companies
          if (selectedCompany === "Kauri Australia (a Limited Partnership)") {
            return index % 3 !== 0; // Show 2/3 of items for Australia
          } else if (selectedCompany === "Kauri New Zealand Ltd") {
            return index % 3 === 0; // Show 1/3 of items for NZ
          }
          return true;
        });
    
    filteredData.forEach(item => {
      // Group by brand (simulating ClipBd grouping since webportal data doesn't have ClipBd)
      // Using BRAND as the equivalent grouping field
      const groupKey = item.BRAND || 'Other';
      
      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, []);
      }
      grouped.get(groupKey)!.push(item);
    });
    
    // Sort groups alphabetically by brand name
    const sortedGroups = Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    
    return new Map(sortedGroups);
  };

  const groupedData = getGroupedData();
  const lastUpdated = new Date().toLocaleDateString('en-GB');
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  if (loading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <div className="w-full">
      {/* Filters */}
      <div className="mb-3 bg-white border border-gray-300 px-4 py-3">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Company:</label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm w-72 min-w-[288px]"
              >
                <option value="All">All Companies</option>
                <option value="Kauri New Zealand Ltd">Kauri New Zealand Ltd</option>
                <option value="Kauri Australia (a Limited Partnership)">Kauri Australia (a Limited Partnership)</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={hideUnavailable}
                onChange={(e) => setHideUnavailable(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span>Hide unavailable items</span>
            </label>
          </div>
          <div className="text-xs text-gray-500">
            <span className="font-medium">Last Updated:</span> {lastUpdated} {currentTime}
          </div>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto border border-gray-300 max-h-[80vh]">
        <table className="w-full border-collapse" style={{ fontSize: '11px' }}>
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-100">
              <th rowSpan={2} className="border border-gray-300 px-2 py-2 text-left font-semibold text-gray-700" style={{ width: '50px' }}>
                Item
              </th>
              <th rowSpan={2} className="border border-gray-300 px-2 py-2 text-left font-semibold text-gray-700" style={{ width: '60px' }}>
                Type
              </th>
              <th rowSpan={2} className="border border-gray-300 px-2 py-2 text-left font-semibold text-gray-700" style={{ width: '100px' }}>
                Wood
              </th>
              <th rowSpan={2} className="border border-gray-300 px-1 py-2 text-center font-semibold text-gray-700" style={{ width: '25px' }}>
                S
              </th>
              <th rowSpan={2} className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700" style={{ width: '70px' }}>
                Seasoning
              </th>
              <th rowSpan={2} className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700" style={{ width: '45px' }}>
                Grain
              </th>
              <th rowSpan={2} className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700" style={{ width: '55px' }}>
                Size/Vol
              </th>
              <th rowSpan={2} className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700" style={{ width: '65px' }}>
                Bending
              </th>
              <th rowSpan={2} className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700" style={{ width: '65px' }}>
                Toasting
              </th>
              <th rowSpan={2} className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700" style={{ width: '80px', backgroundColor: '#F0FDF4' }}>
                Price
              </th>
              <th className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700" style={{ width: '80px', backgroundColor: '#FEF3C7' }}>
                Qty On Hand
              </th>
              <th className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-700" style={{ width: '80px', backgroundColor: '#E0F2FE' }}>
                Qty Available
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from(groupedData.entries()).map(([groupKey, items]) => {
              // groupKey is now the brand name
              const brandName = groupKey;
              
              // Process all items in the group
              const groupItems = items.map((item, index) => {
                    // Generate mock inventory for demo
                    const mockInventory = generateMockInventory(item.KAURIITEMCODE);
                    
                    // Simulate regional distribution with warehouse details including PO and SO
                    const regionBreakdown = {
                      'SA': {
                        warehouses: {
                          'Filmers Warehouse': {
                            onHand: Math.floor(mockInventory.sa013 * 0.4),
                            onPO: Math.floor(Math.random() * 20),
                            onSO: Math.floor(Math.random() * 10),
                          },
                          'SA Office': {
                            onHand: Math.floor(mockInventory.sa013 * 0.2),
                            onPO: Math.floor(Math.random() * 15),
                            onSO: Math.floor(Math.random() * 8),
                          }
                        }
                      },
                      'NSW': {
                        warehouses: {
                          'Melbourne Warehouse': {
                            onHand: Math.floor(mockInventory.sa021 * 0.5),
                            onPO: Math.floor(Math.random() * 25),
                            onSO: Math.floor(Math.random() * 12),
                          },
                          'NSW Office': {
                            onHand: Math.floor(mockInventory.sa021 * 0.3),
                            onPO: Math.floor(Math.random() * 10),
                            onSO: Math.floor(Math.random() * 5),
                          }
                        }
                      },
                      'VIC': {
                        warehouses: {
                          'VIC Office': {
                            onHand: Math.floor(mockInventory.sa015 * 0.6),
                            onPO: Math.floor(Math.random() * 18),
                            onSO: Math.floor(Math.random() * 7),
                          }
                        }
                      },
                      'WA': {
                        warehouses: {
                          'WA Office': {
                            onHand: Math.floor(mockInventory.other * 0.4),
                            onPO: Math.floor(Math.random() * 12),
                            onSO: Math.floor(Math.random() * 6),
                          }
                        }
                      }
                    };
                    
                    // Calculate totals
                    const totalOnHand = Object.values(regionBreakdown).reduce((total, region) => 
                      total + Object.values(region.warehouses).reduce((sum, wh) => sum + wh.onHand, 0), 0
                    );
                    
                    const totalOnPO = Object.values(regionBreakdown).reduce((total, region) => 
                      total + Object.values(region.warehouses).reduce((sum, wh) => sum + wh.onPO, 0), 0
                    );
                    
                    const totalOnSO = Object.values(regionBreakdown).reduce((total, region) => 
                      total + Object.values(region.warehouses).reduce((sum, wh) => sum + wh.onSO, 0), 0
                    );
                    
                    // Calculate available: OnHand + OnPO - OnSO
                    const totalAvailable = Math.max(0, totalOnHand + totalOnPO - totalOnSO);
                    
                    // Apply filter - skip items with no stock if hideUnavailable is true
                    // Hide if BOTH onHand and available are zero or negative
                    if (hideUnavailable && totalOnHand <= 0 && totalAvailable <= 0) {
                      return null;
                    }
                    
                    // Global color coding logic
                    const getColorClass = () => {
                      if (totalOnHand === 0) return 'text-gray-400';
                      
                      if (totalAvailable <= 0) {
                        return 'text-red-600 bg-red-50 font-medium'; // Global shortage
                      } else if (totalAvailable >= totalOnHand) {
                        return 'text-green-600 bg-green-50 font-medium'; // Fully available
                      } else {
                        const globalAvailabilityRatio = totalAvailable / totalOnHand;
                        if (globalAvailabilityRatio >= 0.7) {
                          return 'text-blue-600 bg-blue-50 font-medium'; // 70%+ available
                        } else if (globalAvailabilityRatio >= 0.3) {
                          return 'text-orange-600 bg-orange-50 font-medium'; // 30-70% available
                        } else {
                          return 'text-red-600 bg-red-50 font-medium'; // <30% available
                        }
                      }
                    };
                    
                    // Parse toasting description
                    const toastParts = item.TOASTING?.split(' ') || [];
                    const toastLevel = toastParts[0] || '';
                    const toastType = toastParts.slice(1).join(' ');
                    
                    return (
                      <tr key={`${groupKey}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border-l border-r border-b border-gray-200 px-2 py-1">
                          {item.KAURIITEMCODE}
                        </td>
                        <td className="border-r border-b border-gray-200 px-2 py-1">
                          {item.SHORTDESCRIPTION}
                        </td>
                        <td className="border-r border-b border-gray-200 px-2 py-1">
                          {item.FULLDESCRIPTION?.split(' ').slice(0, 5).join(' ') || item.OAK}
                        </td>
                        <td className="border-r border-b border-gray-200 px-1 py-1 text-center">
                          ✓
                        </td>
                        <td className="border-r border-b border-gray-200 px-2 py-1 text-center">
                          {item.SEASONING}
                        </td>
                        <td className="border-r border-b border-gray-200 px-2 py-1 text-center">
                          {item.GRAIN}
                        </td>
                        <td className="border-r border-b border-gray-200 px-2 py-1 text-center">
                          {item.SIZE}
                        </td>
                        <td className="border-r border-b border-gray-200 px-2 py-1 text-center">
                          {item.BENDING}
                        </td>
                        <td className="border-r border-b border-gray-200 px-2 py-1 text-center">
                          {toastLevel}
                          {toastType && <span className="text-gray-500"> {toastType}</span>}
                        </td>
                        
                        {/* Price column - company specific */}
                        <td className="border-r border-b border-gray-200 px-2 py-1 text-center">
                          {(() => {
                            let price = "";
                            let currency = item.CURRENCY || "";
                            
                            if (selectedCompany === "Kauri Australia (a Limited Partnership)") {
                              price = item.STANDARDPRICETOCUSTOMERAUS || "";
                            } else if (selectedCompany === "Kauri New Zealand Ltd") {
                              price = item.STANDARDPRICETOCUSTOMERNZ || "";
                            } else {
                              // Default to AUS pricing for "All" 
                              price = item.STANDARDPRICETOCUSTOMERAUS || "";
                            }
                            
                            if (price && price !== "0" && price !== "") {
                              // Format price with currency
                              const formattedPrice = parseFloat(price).toLocaleString('en-US', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                              });
                              return (
                                <span className="text-sm font-medium text-green-700">
                                  €{formattedPrice}
                                </span>
                              );
                            } else {
                              return <span className="text-gray-400 text-xs">-</span>;
                            }
                          })()}
                        </td>
                        
                        {/* Qty On Hand with regional breakdown tooltip */}
                        <td className="border-r border-b border-gray-200 px-1 py-1 text-center">
                          {totalOnHand > 0 ? (
                            <div className="relative group">
                              <span 
                                className={`px-2 py-1 rounded cursor-pointer hover:opacity-80 ${totalOnHand > 0 ? 'bg-yellow-50 text-yellow-700' : 'text-gray-400'}`}
                              >
                                {totalOnHand}
                              </span>
                              <div className="absolute right-0 top-6 w-72 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div className="font-semibold mb-2 text-yellow-300">Qty On Hand Breakdown</div>
                                <div className="mb-2 border-b border-gray-700 pb-2">
                                  <div className="text-blue-300">Total On Hand: <span className="text-white font-bold">{totalOnHand}</span></div>
                                </div>
                                <div className="font-medium mb-1 text-blue-300">Regional Breakdown:</div>
                                <div className="space-y-2">
                                  {Object.entries(regionBreakdown).map(([region, data]) => {
                                    const regionOnHand = Object.values(data.warehouses).reduce((sum, wh) => sum + wh.onHand, 0);
                                    return regionOnHand > 0 ? (
                                      <div key={region}>
                                        <div className="text-gray-300 font-medium">{region}: {regionOnHand}</div>
                                        {Object.entries(data.warehouses).map(([warehouse, whData]) => 
                                          whData.onHand > 0 ? (
                                            <div key={warehouse} className="ml-2 text-xs text-gray-400">
                                              {warehouse}: {whData.onHand}
                                            </div>
                                          ) : null
                                        )}
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
                        
                        {/* Qty Available with global color coding and detailed tooltip */}
                        <td className="border-r border-b border-gray-200 px-1 py-1 text-center">
                          {totalAvailable > 0 || totalOnHand > 0 ? (
                            <div className="relative group">
                              <span 
                                className={`px-2 py-1 rounded cursor-pointer hover:opacity-80 ${getColorClass()}`}
                              >
                                {totalAvailable}
                              </span>
                              <div className="absolute right-0 top-6 w-96 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div className="font-semibold mb-2 text-yellow-300">Qty Available Breakdown</div>
                                <div className="mb-2 border-b border-gray-700 pb-2">
                                  <div className="text-blue-300">On Hand: <span className="text-white">{totalOnHand}</span></div>
                                  <div className="text-green-300">On PO: <span className="text-white">+{totalOnPO}</span></div>
                                  <div className="text-red-300">On SO: <span className="text-white">-{totalOnSO}</span></div>
                                  <div className="text-yellow-300 font-bold mt-1 pt-1 border-t border-gray-700">Available: <span className="text-white">{totalAvailable}</span></div>
                                </div>
                                <div className="font-medium mb-1 text-blue-300">Warehouse Breakdown:</div>
                                <div className="space-y-3">
                                  {Object.entries(regionBreakdown).map(([region, data]) => {
                                    const regionOnHand = Object.values(data.warehouses).reduce((sum, wh) => sum + wh.onHand, 0);
                                    const regionOnPO = Object.values(data.warehouses).reduce((sum, wh) => sum + wh.onPO, 0);
                                    const regionOnSO = Object.values(data.warehouses).reduce((sum, wh) => sum + wh.onSO, 0);
                                    const regionAvailable = regionOnHand + regionOnPO - regionOnSO;
                                    return (regionAvailable !== 0 || regionOnHand > 0) ? (
                                      <div key={region}>
                                        <div className="text-gray-300 font-bold text-sm mb-1">{region} Region</div>
                                        {Object.entries(data.warehouses).map(([warehouse, whData]) => {
                                          const whAvailable = whData.onHand + whData.onPO - whData.onSO;
                                          
                                          // Determine color based on availability
                                          let availabilityColor = 'text-gray-400';
                                          if (whData.onHand > 0) {
                                            if (whAvailable <= 0) {
                                              availabilityColor = 'text-red-400 font-bold'; // Oversold
                                            } else if (whAvailable >= whData.onHand) {
                                              availabilityColor = 'text-green-400 font-bold'; // Fully available
                                            } else {
                                              const ratio = whAvailable / whData.onHand;
                                              if (ratio >= 0.7) {
                                                availabilityColor = 'text-blue-400 font-bold';
                                              } else if (ratio >= 0.3) {
                                                availabilityColor = 'text-orange-400 font-bold';
                                              } else {
                                                availabilityColor = 'text-red-400 font-bold';
                                              }
                                            }
                                          }
                                          
                                          return (whData.onHand > 0 || whData.onPO > 0 || whData.onSO > 0) ? (
                                            <div key={warehouse} className="ml-3 mb-1 p-1 rounded bg-gray-800">
                                              <div className="font-medium text-gray-200 mb-1">{warehouse}</div>
                                              <div className="ml-2 space-y-0.5">
                                                <div className="flex justify-between">
                                                  <span className="text-yellow-200">On Hand:</span>
                                                  <span className={whData.onHand > 0 ? "text-yellow-100 font-medium" : "text-gray-500"}>{whData.onHand}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-green-300">On PO:</span>
                                                  <span className={whData.onPO > 0 ? "text-green-100 font-medium" : "text-gray-500"}>+{whData.onPO}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-red-300">On SO:</span>
                                                  <span className={whData.onSO > 0 ? "text-red-100 font-medium" : "text-gray-500"}>-{whData.onSO}</span>
                                                </div>
                                                <div className="flex justify-between pt-0.5 border-t border-gray-700">
                                                  <span className="text-gray-300">Available:</span>
                                                  <span className={availabilityColor}>{whAvailable}</span>
                                                </div>
                                              </div>
                                            </div>
                                          ) : null;
                                        })}
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
                      </tr>
                    );
                  }).filter(item => item !== null);
              
              // If no items have stock and filter is active, skip this entire group
              if (hideUnavailable && groupItems.length === 0) {
                return null;
              }
              
              // Return group header and items
              return [
                <tr key={`group-${groupKey}`} style={{ backgroundColor: '#FED7AA' }}>
                  <td colSpan={12} className="border border-gray-300 px-3 py-1 font-bold">
                    {brandName}
                  </td>
                </tr>,
                ...groupItems
              ];
            }).flat().filter(item => item !== null)}
          </tbody>
        </table>
      </div>
    </div>
  );
}