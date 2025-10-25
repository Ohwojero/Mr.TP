"use client";

import type React from "react";
import Link from "next/link";

import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type RootState, logout, addExpense, deleteExpense } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, DollarSign } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { DataTable } from "@/components/data-table";
import { ArrowLeft } from "lucide-react";

const EXPENSE_CATEGORIES = [
  "Supplies",
  "Utilities",
  "Rent",
  "Salaries",
  "Marketing",
  "Maintenance",
  "Other",
];

export default function ExpensesPage() {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { items: expenses } = useSelector((state: RootState) => state.expenses);
  const dispatch = useDispatch();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: 0,
    category: "Supplies",
  });

  useEffect(() => {
    if (
      !isAuthenticated ||
      (user?.role !== "admin" && user?.role !== "manager")
    ) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || formData.amount <= 0) return;

    const newExpense = {
      id: `exp-${Date.now()}`,
      description: formData.description,
      amount: formData.amount,
      category: formData.category,
      date: new Date().toISOString(),
      createdBy: user?.id || "",
    };

    dispatch(addExpense(newExpense));
    setFormData({ description: "", amount: 0, category: "Supplies" });
    setIsOpen(false);
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      dispatch(deleteExpense(expenseId));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  if (
    !isAuthenticated ||
    (user?.role !== "admin" && user?.role !== "manager")
  ) {
    return null;
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const expensesByCategory = EXPENSE_CATEGORIES.map((cat) => ({
    category: cat,
    amount: expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0),
  }));

  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const monthlyExpenses = expenses
    .filter((e) => {
      const expenseDate = new Date(e.date);
      const now = new Date();
      return (
        expenseDate.getMonth() === now.getMonth() &&
        expenseDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const tableColumns = [
    {
      key: "description",
      label: "Description",
      searchable: true,
    },
    {
      key: "category",
      label: "Category",
      searchable: true,
      render: (value: string) => (
        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-muted text-muted-foreground">
          {value}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: "date",
      label: "Date",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "id",
      label: "Actions",
      render: (value: string) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteExpense(value)}
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Sidebar />

      {/* Main Content */}
      <main className="md:ml-64 p-4 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="hover:bg-white/50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <h2 className="text-3xl font-bold flex items-center gap-3 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              Expense Tracking
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Monitor and manage business expenses
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Record New Expense</DialogTitle>
                <DialogDescription>
                  Add a new business expense
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="e.g., Office supplies purchase"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <Button type="submit" className="w-full">
                  Record Expense
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
                  <DollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                All time expenses
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                {currentMonth} Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                  ${monthlyExpenses.toFixed(0)}
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full">
                  <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                Current month total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-amber-50 to-lime-50 dark:from-amber-950/20 dark:to-lime-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                Total Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                  {expenses.length}
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                  <Plus className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                Expense entries
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Expenses by Category */}
        <Card className="mb-12 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              Expenses by Category
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
              Breakdown of expenses across different categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expensesByCategory.map((item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-600/50 transition-colors"
                >
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="w-40 h-3 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            totalExpenses > 0
                              ? (item.amount / totalExpenses) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white w-24 text-right">
                      ${item.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expenses Table with Pagination and Search */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              All Expenses
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
              Total records:{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {expenses.length}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={tableColumns}
              data={expenses}
              itemsPerPage={10}
              searchPlaceholder="Search by description or category..."
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
