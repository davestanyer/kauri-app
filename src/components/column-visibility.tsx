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
}

export function ColumnVisibility({ columns, visibleColumns, onToggle, onToggleAll }: ColumnVisibilityProps) {
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
        Columns ({visibleCount}/{totalCount})
      </Button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-72 z-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-900">Column Visibility</span>
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
          
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
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