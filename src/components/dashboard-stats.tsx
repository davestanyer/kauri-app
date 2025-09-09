"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  AlertTriangle, 
  CheckCircle,
  DollarSign
} from "lucide-react";

const stats = [
  {
    title: "Total Items",
    value: "2,847",
    change: "+12%",
    changeType: "positive",
    icon: Package,
    description: "All inventory items"
  },
  {
    title: "Available",
    value: "1,923",
    change: "+8%",
    changeType: "positive",
    icon: CheckCircle,
    description: "Ready for use"
  },
  {
    title: "Limited Stock",
    value: "156",
    change: "-3%",
    changeType: "negative",
    icon: AlertTriangle,
    description: "Low quantity"
  },
  {
    title: "Total Value",
    value: "$284K",
    change: "+23%",
    changeType: "positive",
    icon: DollarSign,
    description: "Inventory value"
  }
];

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="bg-white border border-gray-200 hover:border-gray-300 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Icon className="w-4 h-4 text-gray-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {stat.description}
                  </p>
                  <span className={`text-xs font-medium ${stat.changeType === "positive" ? "text-green-600" : "text-red-600"}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}