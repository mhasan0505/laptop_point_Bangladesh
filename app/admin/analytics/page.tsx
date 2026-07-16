"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, PieChart } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black mb-2">Analytics</h1>
        <p className="text-gray-600">
          View your store performance and insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">
              Total Visits
            </CardTitle>
            <LineChart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">12,345</div>
            <p className="text-xs text-blue-600">+15% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-900">
              Conversion Rate
            </CardTitle>
            <BarChart className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">3.2%</div>
            <p className="text-xs text-green-600">+0.4% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">
              Sales Distribution
            </CardTitle>
            <PieChart className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">BDT 450k</div>
            <p className="text-xs text-purple-600">Top Category: Laptops</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-3 mb-4">
              <span className="text-xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Advanced Analytics Coming Soon
            </h3>
            <p className="text-gray-500 max-w-sm mt-2">
              We are building comprehensive reporting tools to help you grow
              your business.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
