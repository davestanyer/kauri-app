"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Edit, 
  Eye
} from "lucide-react";

// Mock enterprise data (not connected to database/API)
const inventoryData = [
  {
    id: "R1002",
    group: "Barrel Racks",
    description: "Standard Hogshead Cradle (H size)",
    supplier: "Tonnellerie Baron",
    sku: "THC-169-STD",
    unitCost: 89.50,
    sa013: 169,
    sa021: 0,
    sa015: 0,
    other: 8,
    status: "available" as const,
    priority: "normal" as const,
    lastUpdated: "2024-01-15",
    updatedBy: "D. Hunt"
  },
  {
    id: "FU-017231-381",
    group: "Bottles",
    description: "Bord Antica Cork 1.5L Antique Green VE",
    supplier: "Vetropack",
    sku: "VP-BAC-1.5L-AG",
    unitCost: 2.35,
    sa013: 0,
    sa021: 1524,
    sa015: 0,
    other: 1,
    status: "available" as const,
    priority: "normal" as const,
    lastUpdated: "2024-01-15",
    updatedBy: "M. Chen"
  },
  {
    id: "BU-024332-2432",
    group: "Bottles",
    description: "Burg BVS 375mL Antique Green",
    supplier: "Bordeaux Glass",
    sku: "BG-BVS-375-AG",
    unitCost: 1.89,
    sa013: 0,
    sa021: 2432,
    sa015: 0,
    other: 6,
    status: "limited" as const,
    priority: "high" as const,
    lastUpdated: "2024-01-14",
    updatedBy: "S. Taylor"
  },
  {
    id: "SP-015288-15288",
    group: "Bottles",
    description: "Sparkling Light 750mL Green",
    supplier: "Glass International",
    sku: "GI-SL-750-GR",
    unitCost: 1.24,
    sa013: 0,
    sa021: 15288,
    sa015: 0,
    other: 6599,
    status: "available" as const,
    priority: "normal" as const,
    lastUpdated: "2024-01-15",
    updatedBy: "A. Rodriguez"
  },
  {
    id: "R1003",
    group: "Barrel Racks",
    description: "Premium Barrel Stand (P size)",
    supplier: "Tonnellerie Baron", 
    sku: "PBS-22-PREM",
    unitCost: 145.00,
    sa013: 22,
    sa021: 0,
    sa015: 0,
    other: 3,
    status: "limited" as const,
    priority: "high" as const,
    lastUpdated: "2024-01-13",
    updatedBy: "D. Hunt"
  },
  {
    id: "BU-000012-12",
    group: "Bottles",
    description: "Premium Wine Bottle 750mL Clear",
    supplier: "Crystal Glass Co",
    sku: "CGC-PWB-750-CL",
    unitCost: 3.45,
    sa013: 0,
    sa021: 12,
    sa015: 0,
    other: 0,
    status: "out-of-stock" as const,
    priority: "urgent" as const,
    lastUpdated: "2024-01-10",
    updatedBy: "K. Williams"
  },
  {
    id: "EQ-445566-78",
    group: "Equipment",
    description: "Pneumatic Cork Insertion Machine",
    supplier: "Enomac Systems",
    sku: "ES-PCIM-2024",
    unitCost: 2450.00,
    sa013: 2,
    sa021: 1,
    sa015: 0,
    other: 0,
    status: "available" as const,
    priority: "normal" as const,
    lastUpdated: "2024-01-12",
    updatedBy: "T. Martinez"
  },
  {
    id: "CK-998877-123",
    group: "Corks",
    description: "Natural Cork #9 Premium Grade",
    supplier: "Amorim Cork",
    sku: "AC-NC9-PREM",
    unitCost: 0.45,
    sa013: 50000,
    sa021: 25000,
    sa015: 12000,
    other: 8000,
    status: "available" as const,
    priority: "normal" as const,
    lastUpdated: "2024-01-16",
    updatedBy: "L. Johnson"
  },
  {
    id: "R2001",
    group: "Barrel Racks",
    description: "Heavy Duty Steel Barrel Rack",
    supplier: "Industrial Storage",
    sku: "IS-HDSR-2024",
    unitCost: 125.00,
    sa013: 45,
    sa021: 12,
    sa015: 8,
    other: 2,
    status: "available" as const,
    priority: "normal" as const,
    lastUpdated: "2024-01-14",
    updatedBy: "R. Davis"
  },
  {
    id: "BT-556677-890",
    group: "Bottles",
    description: "Bordeaux Style 750mL Dark Green",
    supplier: "French Glass Co",
    sku: "FGC-BS-750-DG",
    unitCost: 1.95,
    sa013: 8500,
    sa021: 12000,
    sa015: 5500,
    other: 2200,
    status: "available" as const,
    priority: "normal" as const,
    lastUpdated: "2024-01-16",
    updatedBy: "N. Smith"
  },
  {
    id: "EQ-123456-99",
    group: "Equipment",
    description: "Digital pH Meter Pro",
    supplier: "VineTech Solutions",
    sku: "VTS-PHM-PRO",
    unitCost: 899.00,
    sa013: 5,
    sa021: 3,
    sa015: 2,
    other: 1,
    status: "limited" as const,
    priority: "high" as const,
    lastUpdated: "2024-01-11",
    updatedBy: "P. Wilson"
  },
  {
    id: "CK-334455-678",
    group: "Corks",
    description: "Synthetic Cork Premium White",
    supplier: "Nomacorc",
    sku: "NM-SC-PW-24",
    unitCost: 0.28,
    sa013: 75000,
    sa021: 45000,
    sa015: 32000,
    other: 18000,
    status: "available" as const,
    priority: "normal" as const,
    lastUpdated: "2024-01-15",
    updatedBy: "H. Brown"
  },
  {
    id: "BT-789012-345",
    group: "Bottles",
    description: "Champagne Bottle 750mL Antique",
    supplier: "Champagne Glass Ltd",
    sku: "CGL-CB-750-ANT",
    unitCost: 3.20,
    sa013: 120,
    sa021: 450,
    sa015: 0,
    other: 25,
    status: "limited" as const,
    priority: "high" as const,
    lastUpdated: "2024-01-13",
    updatedBy: "G. Taylor"
  },
  {
    id: "R3005",
    group: "Barrel Racks",
    description: "Mobile Barrel Cart System",
    supplier: "Winery Equipment Co",
    sku: "WEC-MBCS-2024",
    unitCost: 350.00,
    sa013: 8,
    sa021: 4,
    sa015: 2,
    other: 1,
    status: "available" as const,
    priority: "normal" as const,
    lastUpdated: "2024-01-14",
    updatedBy: "C. Anderson"
  },
  {
    id: "EQ-987654-321",
    group: "Equipment",
    description: "Stainless Steel Cleaning Kit",
    supplier: "CleanTech Pro",
    sku: "CTP-SSCK-FULL",
    unitCost: 175.50,
    sa013: 0,
    sa021: 0,
    sa015: 0,
    other: 0,
    status: "out-of-stock" as const,
    priority: "urgent" as const,
    lastUpdated: "2024-01-09",
    updatedBy: "M. Garcia"
  }
];

const statusColors = {
  "available": "bg-green-100 text-green-800 border-green-200",
  "limited": "bg-yellow-100 text-yellow-800 border-yellow-200", 
  "out-of-stock": "bg-red-100 text-red-800 border-red-200",
  "reserved": "bg-blue-100 text-blue-800 border-blue-200"
};

const groupColors = {
  "Barrel Racks": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Bottles": "bg-blue-100 text-blue-800 border-blue-200",
  "Equipment": "bg-purple-100 text-purple-800 border-purple-200",
  "Corks": "bg-orange-100 text-orange-800 border-orange-200"
};

export function InventoryTable() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const getTotalStock = (item: typeof inventoryData[0]) => {
    return item.sa013 + item.sa021 + item.sa015 + item.other;
  };

  const getTotalValue = (item: typeof inventoryData[0]) => {
    return getTotalStock(item) * item.unitCost;
  };

  return (
    <div className="w-full">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Inventory</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{inventoryData.length} items</span>
            <Button variant="outline" size="sm">Export</Button>
          </div>
        </div>
      </div>

      {/* Clean Table */}
      <div className="overflow-x-auto">
        <Table className="table-enterprise">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input type="checkbox" className="rounded border-gray-300" />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Unit Cost</TableHead>
              <TableHead className="text-right">SA013</TableHead>
              <TableHead className="text-right">SA021</TableHead>
              <TableHead className="text-right">SA015</TableHead>
              <TableHead className="text-right">Other</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryData.map((item) => {
              const total = getTotalStock(item);
              
              return (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell>
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems([...selectedItems, item.id]);
                        } else {
                          setSelectedItems(selectedItems.filter(id => id !== item.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className="text-sm">{item.id}</TableCell>
                  <TableCell className="text-sm">{item.description}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs px-2 py-1 rounded-md font-medium border ${groupColors[item.group as keyof typeof groupColors]}`}>
                      {item.group}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{item.supplier}</TableCell>
                  <TableCell className="text-right text-sm">${item.unitCost.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-sm">{item.sa013.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-sm">{item.sa021.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-sm">{item.sa015.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-sm">{item.other.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-sm font-bold">{total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs px-2 py-1 rounded-md font-medium border ${statusColors[item.status as keyof typeof statusColors]}`}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Simple Footer */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Showing 1-{inventoryData.length} of 2,847 items</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}