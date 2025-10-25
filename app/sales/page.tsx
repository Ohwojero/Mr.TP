"use client";

import type React from "react";
import Link from "next/link";

import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  type RootState,
  logout,
  addSale,
  deleteSale,
  updateStock,
} from "@/lib/store";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { DataTable } from "@/components/data-table";
import { ArrowLeft } from "lucide-react";

export default function SalesPage() {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { items: products } = useSelector((state: RootState) => state.products);
  const { items: sales } = useSelector((state: RootState) => state.sales);
  const dispatch = useDispatch();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    quantity: 1,
  });

  useEffect(() => {
    if (
      !isAuthenticated ||
      (user?.role !== "admin" && user?.role !== "manager")
    ) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || formData.quantity <= 0) return;

    const product = products.find((p) => p.id === formData.productId);
    if (!product) return;

    if (product.quantity < formData.quantity) {
      alert("Insufficient stock available");
      return;
    }

    const newSale = {
      id: `sale-${Date.now()}`,
      productId: formData.productId,
      quantity: formData.quantity,
      price: product.price,
      total: product.price * formData.quantity,
      date: new Date().toISOString(),
      salesPersonId: user?.id || "",
    };

    dispatch(addSale(newSale));
    dispatch(
      updateStock({
        id: formData.productId,
        quantity: product.quantity - formData.quantity,
      })
    );

    setFormData({ productId: "", quantity: 1 });
    setIsOpen(false);
  };

  const handleDeleteSale = (saleId: string) => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return;

    if (confirm("Are you sure you want to delete this sale?")) {
      dispatch(deleteSale(saleId));
      const product = products.find((p) => p.id === sale.productId);
      if (product) {
        dispatch(
          updateStock({
            id: sale.productId,
            quantity: product.quantity + sale.quantity,
          })
        );
      }
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

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalSales = sales.length;
  const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

  const tableColumns = [
    {
      key: "productId",
      label: "Product",
      searchable: true,
      render: (value: string) => {
        const product = products.find((p) => p.id === value);
        return product?.name || "Unknown";
      },
    },
    {
      key: "quantity",
      label: "Quantity",
      render: (value: number) => value,
    },
    {
      key: "price",
      label: "Unit Price",
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: "total",
      label: "Total",
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
          onClick={() => handleDeleteSale(value)}
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              Sales Management
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Track and manage sales transactions
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Record New Sale</DialogTitle>
                <DialogDescription>
                  Create a new sales transaction
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddSale} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Product</Label>
                  <Select
                    value={formData.productId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, productId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} (Stock: {product.quantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: Number.parseInt(e.target.value) || 1,
                      })
                    }
                    required
                  />
                </div>

                {formData.productId && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Total Amount
                    </p>
                    <p className="text-2xl font-bold">
                      $
                      {(
                        (products.find((p) => p.id === formData.productId)
                          ?.price || 0) * formData.quantity
                      ).toFixed(2)}
                    </p>
                  </div>
                )}

                <Button type="submit" className="w-full">
                  Record Sale
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {totalSales}
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                  <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                Transactions completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                  ${totalRevenue.toFixed(0)}
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
                  <Plus className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                Revenue generated
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                Average Order Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                  ${averageOrderValue.toFixed(0)}
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                  <ShoppingCart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                Per transaction average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sales Table with Pagination and Search */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              Sales Transactions
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
              Total transactions:{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {sales.length}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={tableColumns}
              data={sales}
              itemsPerPage={10}
              searchPlaceholder="Search by product name..."
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
