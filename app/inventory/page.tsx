"use client";

import type React from "react";
import Link from "next/link";

import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  type RootState,
  logout,
  addProduct,
  updateProduct,
  deleteProduct,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Edit2,
  Package,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { DataTable } from "@/components/data-table";

export default function InventoryPage() {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { items: products } = useSelector((state: RootState) => state.products);
  const dispatch = useDispatch();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    quantity: 0,
    reorderLevel: 0,
    price: 0,
    cost: 0,
    category: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) return;

    if (editingId) {
      dispatch(
        updateProduct({
          id: editingId,
          ...formData,
        })
      );
      setEditingId(null);
    } else {
      const newProduct = {
        id: `prod-${Date.now()}`,
        ...formData,
      };
      dispatch(addProduct(newProduct));
    }

    setFormData({
      name: "",
      sku: "",
      quantity: 0,
      reorderLevel: 0,
      price: 0,
      cost: 0,
      category: "",
    });
    setIsOpen(false);
  };

  const handleEditProduct = (product: any) => {
    setFormData(product);
    setEditingId(product.id);
    setIsOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(productId));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  const lowStockProducts = products.filter((p) => p.quantity <= p.reorderLevel);
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.quantity * p.cost,
    0
  );

  const tableColumns = [
    {
      key: "name",
      label: "Name",
      searchable: true,
    },
    {
      key: "sku",
      label: "SKU",
      searchable: true,
    },
    {
      key: "category",
      label: "Category",
      searchable: true,
    },
    {
      key: "quantity",
      label: "Quantity",
      render: (value: number, row: any) => (
        <span
          className={`inline-block px-2 py-1 rounded text-sm font-medium ${
            value <= row.reorderLevel
              ? "bg-destructive/10 text-destructive"
              : "bg-primary/10 text-primary"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "cost",
      label: "Cost",
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: "price",
      label: "Price",
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: "id",
      label: "Actions",
      render: (value: string, row: any) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditProduct(row)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteProduct(value)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Sidebar />

      {/* Main Content */}
      <main className="md:ml-64 p-4 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              Inventory Management
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage products and stock levels efficiently
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    name: "",
                    sku: "",
                    quantity: 0,
                    reorderLevel: 0,
                    price: 0,
                    cost: 0,
                    category: "",
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Product" : "Add New Product"}
                </DialogTitle>
                <DialogDescription>
                  {editingId
                    ? "Update product details"
                    : "Create a new product in inventory"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Laptop"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    placeholder="e.g., LAP-001"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity: Number.parseInt(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reorderLevel">Reorder Level</Label>
                    <Input
                      id="reorderLevel"
                      type="number"
                      value={formData.reorderLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reorderLevel: Number.parseInt(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost">Cost</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cost: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Electronics"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  {editingId ? "Update Product" : "Add Product"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-slate-900 dark:text-white">
                  {products.length}
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                  <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                Active items in inventory
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                Low Stock Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-red-600 dark:text-red-400">
                  {lowStockProducts.length}
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                Items below reorder level
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                Inventory Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                  ${totalInventoryValue.toFixed(0)}
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
                  <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                Total cost of stock
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Card className="mb-12 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                Low Stock Alert
              </CardTitle>
              <CardDescription className="text-red-600 dark:text-red-400">
                The following items are below reorder level and need attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 bg-white/70 dark:bg-slate-800/70 rounded-lg border border-red-100 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Current stock:{" "}
                        <span className="font-medium text-red-600 dark:text-red-400">
                          {product.quantity}
                        </span>{" "}
                        | Reorder level:{" "}
                        <span className="font-medium text-orange-600 dark:text-orange-400">
                          {product.reorderLevel}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-full text-sm font-medium">
                        Restock Needed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Table with Pagination and Search */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <Package className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </div>
              All Products
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
              Total products:{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {products.length}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={tableColumns}
              data={products}
              itemsPerPage={10}
              searchPlaceholder="Search by name, SKU, or category..."
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
