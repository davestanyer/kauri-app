"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Settings } from "lucide-react";
import { useState } from "react";

interface ColumnVisibilityProps {
  columns: string[];
  visibleColumns: Record<string, boolean>;
  onToggle: (column: string) => void;
  onToggleAll: (visible: boolean) => void;
  onToggleRegion: (region: string, visible: boolean) => void;
  groupedByRegion?: Record<string, string[]>;
}

export function ColumnVisibility({ columns, visibleColumns, onToggle, onToggleAll, onToggleRegion, groupedByRegion }: ColumnVisibilityProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const visibleCount = Object.values(visibleColumns).filter(Boolean).length;
  const totalCount = columns.length;

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Settings className="w-4 h-4" />
        Show/Hide Warehouses ({visibleCount}/{totalCount})
      </Button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-96 z-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-900">Show/Hide Warehouses</span>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => onToggleAll(true)}
                className="text-xs px-2 py-1"
              >
                Show All
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => onToggleAll(false)}
                className="text-xs px-2 py-1"
              >
                Hide All
              </Button>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {groupedByRegion ? (
              // Group by region if available
              Object.entries(groupedByRegion).map(([region, warehouses]) => {
                const regionVisibleCount = warehouses.filter(w => visibleColumns[w]).length;
                const allVisible = regionVisibleCount === warehouses.length;
                const someVisible = regionVisibleCount > 0;
                
                return (
                  <div key={region} className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                        onClick={() => onToggleRegion(region, !allVisible)}
                      >
                        {allVisible ? (
                          <Eye className="w-4 h-4 text-blue-600" />
                        ) : someVisible ? (
                          <Eye className="w-4 h-4 text-blue-400" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                        <Badge variant="outline" className="text-xs font-medium">
                          {region}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          ({regionVisibleCount}/{warehouses.length})
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-1 ml-2">
                      {warehouses.map(warehouse => (
                        <div 
                          key={warehouse} 
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          onClick={() => onToggle(warehouse)}
                        >
                          {visibleColumns[warehouse] ? (
                            <Eye className="w-4 h-4 text-blue-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                          <span className={`text-sm ${visibleColumns[warehouse] ? 'text-gray-900' : 'text-gray-500'}`}>
                            {warehouse}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              // Fallback to simple list
              <div className="grid grid-cols-2 gap-2">
                {columns.map(column => (
                  <div 
                    key={column} 
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => onToggle(column)}
                  >
                    {visibleColumns[column] ? (
                      <Eye className="w-4 h-4 text-blue-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={`text-sm ${visibleColumns[column] ? 'text-gray-900' : 'text-gray-500'}`}>
                      {column}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <Button 
              size="sm" 
              onClick={() => setIsOpen(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Done
            </Button>
          </div>
        </div>
      )}
      
      {/* Overlay to close when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}