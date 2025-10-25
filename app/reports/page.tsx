"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { RootState } from "@/lib/store";
import { useDispatch } from "react-redux";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Sidebar } from "@/components/sidebar";

export default function ReportsPage() {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { items: products } = useSelector((state: RootState) => state.products);
  const { items: sales } = useSelector((state: RootState) => state.sales);
  const { items: expenses } = useSelector((state: RootState) => state.expenses);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  // Calculate metrics
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.quantity * p.cost,
    0
  );

  // Sales by product
  const salesByProduct = products.map((product) => {
    const productSales = sales.filter((s) => s.productId === product.id);
    return {
      name: product.name,
      sales: productSales.length,
      revenue: productSales.reduce((sum, s) => sum + s.total, 0),
    };
  });

  // Expenses by category
  const expensesByCategory = [
    {
      name: "Supplies",
      value: expenses
        .filter((e) => e.category === "Supplies")
        .reduce((sum, e) => sum + e.amount, 0),
    },
    {
      name: "Utilities",
      value: expenses
        .filter((e) => e.category === "Utilities")
        .reduce((sum, e) => sum + e.amount, 0),
    },
    {
      name: "Rent",
      value: expenses
        .filter((e) => e.category === "Rent")
        .reduce((sum, e) => sum + e.amount, 0),
    },
    {
      name: "Salaries",
      value: expenses
        .filter((e) => e.category === "Salaries")
        .reduce((sum, e) => sum + e.amount, 0),
    },
    {
      name: "Marketing",
      value: expenses
        .filter((e) => e.category === "Marketing")
        .reduce((sum, e) => sum + e.amount, 0),
    },
    {
      name: "Maintenance",
      value: expenses
        .filter((e) => e.category === "Maintenance")
        .reduce((sum, e) => sum + e.amount, 0),
    },
    {
      name: "Other",
      value: expenses
        .filter((e) => e.category === "Other")
        .reduce((sum, e) => sum + e.amount, 0),
    },
  ].filter((item) => item.value > 0);

  // Stock status
  const lowStockProducts = products.filter((p) => p.quantity <= p.reorderLevel);
  const adequateStockProducts = products.filter(
    (p) => p.quantity > p.reorderLevel
  );

  const COLORS = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Sidebar />

      {/* Main Content */}
      <main className="md:ml-64 p-4 md:p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            Reports & Analytics
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Business performance and insights
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">
                  ${totalRevenue.toFixed(0)}
                </div>
                <div className="p-3 bg-cyan-100 dark:bg-cyan-900/50 rounded-full">
                  <TrendingUp className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                From {sales.length} sales
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-red-600 dark:text-red-400">
                  ${totalExpenses.toFixed(0)}
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full">
                  <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                {expenses.length} expense records
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                Net Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div
                  className={`text-4xl font-bold ${
                    netProfit >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  ${netProfit.toFixed(0)}
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
                  <TrendingUp
                    className={`w-6 h-6 ${
                      netProfit >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                Revenue - Expenses
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                Inventory Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                  ${totalInventoryValue.toFixed(0)}
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                  <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                {products.length} products
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Sales by Product */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                Sales by Product
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
                Revenue generated per product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesByProduct}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Expenses by Category */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                Expenses by Category
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
                Distribution of business expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) =>
                      `${name}: $${(value as number).toFixed(0)}`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Stock Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                Stock Status Overview
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
                Inventory health check
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Adequate Stock",
                        value: adequateStockProducts.length,
                      },
                      { name: "Low Stock", value: lowStockProducts.length },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value as number}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                Summary Statistics
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
                Key business metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-600/50 transition-colors">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Total Products
                </span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {products.length}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-600/50 transition-colors">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Total Sales Transactions
                </span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {sales.length}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-600/50 transition-colors">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Profit Margin
                </span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {totalRevenue > 0
                    ? ((netProfit / totalRevenue) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-600/50 transition-colors">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Low Stock Items
                </span>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {lowStockProducts.length}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-600/50 transition-colors">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Average Product Price
                </span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  $
                  {(
                    products.reduce((sum, p) => sum + p.price, 0) /
                      products.length || 0
                  ).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
