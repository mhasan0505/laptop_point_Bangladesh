"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart as BarChartIcon, LineChart as LineChartIcon, PieChart as PieChartIcon, TrendingUp, DollarSign, ShoppingBag, Users, MousePointerClick, Activity } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

interface AnalyticsDashboardProps {
  initialData: {
    totalRevenue: number;
    totalOrders: number;
    salesDistribution: { name: string; value: number }[];
    trendData: { label: string; revenue: number }[];
  };
  ga4Data?: {
    totalUsers: number;
    totalPageViews: number;
    totalSessions: number;
    trafficSources: { name: string; value: number }[];
  } | null;
  currentRange: string;
}

const BRAND_RED = '#DC0303';
const BRAND_BLUE = '#002B60';

// A mix of brand colors and complementary colors for charts
const PIE_COLORS = [BRAND_BLUE, BRAND_RED, '#3b82f6', '#f87171', '#1e3a8a', '#991b1b'];

export default function AnalyticsDashboard({ initialData, ga4Data, currentRange }: AnalyticsDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { totalRevenue, totalOrders, salesDistribution, trendData } = initialData;

  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('range', e.target.value);
    router.push(pathname + '?' + params.toString());
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      
      {/* Filters Section */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">E-commerce Performance</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 font-medium">Date Range:</span>
          <select 
            value={currentRange}
            onChange={handleRangeChange}
            className="border-gray-300 rounded-md shadow-sm text-sm focus:ring-[#002B60] focus:border-[#002B60] py-1.5 pl-3 pr-8"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last 1 Year</option>
          </select>
        </div>
      </div>
      
      {/* 1. E-commerce Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-[#002B60] shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-5 w-5 text-[#002B60]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-gray-900">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-gray-500 mt-1">For selected period</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-[#DC0303] shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Orders
            </CardTitle>
            <ShoppingBag className="h-5 w-5 text-[#DC0303]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-gray-900">{totalOrders}</div>
            <p className="text-xs text-gray-500 mt-1">Completed orders</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-gray-400 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Top Category
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-gray-900">
              {salesDistribution.length > 0 ? salesDistribution[0].name : "N/A"}
            </div>
            <p className="text-xs text-gray-500 mt-1">By sales volume</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Area Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <LineChartIcon className="w-5 h-5 text-[#002B60]" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData}
                  margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={BRAND_BLUE} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={BRAND_BLUE} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="label" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    tickFormatter={(value) => `৳${value / 1000}k`}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    dx={-10}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={BRAND_BLUE} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sales Distribution Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <PieChartIcon className="w-5 h-5 text-[#DC0303]" />
              Sales Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {salesDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => (percent ?? 0)
 > 0.05 ? `${name} ${((percent ?? 0) * 100).toFixed(0)}%` : null}
                      labelLine={false}
                    >
                      {salesDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No sales data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. GA4 Metrics */}
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2 pt-8">Website Traffic (Google Analytics 4)</h2>
      
      {ga4Data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card className="bg-[#f8fafc] border border-gray-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Users
                </CardTitle>
                <Users className="h-5 w-5 text-[#002B60]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-gray-900">{ga4Data.totalUsers.toLocaleString()}</div>
              </CardContent>
            </Card>

             <Card className="bg-[#f8fafc] border border-gray-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Page Views
                </CardTitle>
                <MousePointerClick className="h-5 w-5 text-[#DC0303]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-gray-900">{ga4Data.totalPageViews.toLocaleString()}</div>
              </CardContent>
            </Card>

             <Card className="bg-[#f8fafc] border border-gray-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Sessions
                </CardTitle>
                <Activity className="h-5 w-5 text-[#002B60]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-gray-900">{ga4Data.totalSessions.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <BarChartIcon className="w-5 h-5 text-[#002B60]" />
                Traffic Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ga4Data.trafficSources}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false}
                      width={120}
                      tick={{ fill: '#4b5563', fontSize: 13 }}
                    />
                    <Tooltip 
                      formatter={(value) => [value, "Sessions"]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f3f4f6' }}
                    />
                    <Bar dataKey="value" fill={BRAND_BLUE} radius={[0, 4, 4, 0]} barSize={32}>
                       {ga4Data.trafficSources.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="shadow-sm">
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gray-100 p-3 mb-4">
                <span className="text-xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Google Analytics Connection Failed
              </h3>
              <p className="text-gray-500 max-w-sm mt-2">
                Please check if the credentials and Property ID are valid, and if the service account email is added as a Viewer in GA4.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
