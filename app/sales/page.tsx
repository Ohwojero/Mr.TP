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
import { Plus, Trash2, ShoppingCart, Download, Printer } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { DataTable } from "@/components/data-table";
import { ArrowLeft } from "lucide-react";

export default function SalesPage() {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { items: products } = useSelector((state: RootState) => state.products);
  const { items: sales } = useSelector((state: RootState) => state.sales);
  const { items: users } = useSelector((state: RootState) => state.users);
  const dispatch = useDispatch();
  const router = useRouter();

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalSales = sales.length;
  const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    quantity: 1,
    paymentMode: "POS" as "POS" | "transfer" | "cash",
  });

  useEffect(() => {
    if (
      !isAuthenticated ||
      (user?.role !== "admin" && user?.role !== "manager" && user?.role !== "salesgirl")
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
      paymentMode: formData.paymentMode,
    };

    dispatch(addSale(newSale));
    dispatch(
      updateStock({
        id: formData.productId,
        quantity: product.quantity - formData.quantity,
      })
    );

    setFormData({ productId: "", quantity: 1, paymentMode: "POS" });
    setIsOpen(false);
  };

  const handleDeleteSale = (saleId: string) => {
    if (user?.role === "salesgirl") return;

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

  const generatePDF = async () => {
    try {
      const jsPDF = (await import("jspdf")).default;
      const pdf = new jsPDF("p", "mm", "a4");

      // Set font
      pdf.setFont("helvetica", "normal");

      // Header
      pdf.setFontSize(20);
      pdf.text("Mr. TP - Sales Report", 105, 20, { align: "center" });

      pdf.setFontSize(12);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 30, { align: "center" });

      // Table headers
      const headers = ["Product", "Quantity", "Unit Price", "Total", "Sales Person", "Date", "Payment Mode"];
      let yPosition = 50;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");

      headers.forEach((header, index) => {
        const xPosition = 10 + (index * 25);
        pdf.text(header, xPosition, yPosition);
      });

      yPosition += 10;

      // Table data
      pdf.setFont("helvetica", "normal");

      sales.forEach((sale) => {
        const product = products.find((p) => p.id === sale.productId);
        const salesPerson = users.find((u) => u.id === sale.salesPersonId);

        const rowData = [
          product?.name || "Unknown",
          sale.quantity.toString(),
          `₦${sale.price.toFixed(2)}`,
          `₦${sale.total.toFixed(2)}`,
          salesPerson?.name || "Unknown",
          new Date(sale.date).toLocaleDateString(),
          sale.paymentMode,
        ];

        rowData.forEach((data, index) => {
          const xPosition = 10 + (index * 25);
          pdf.text(data, xPosition, yPosition);
        });

        yPosition += 8;

        // Add new page if needed
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
      });

      // Summary
      yPosition += 10;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text(`Total Sales: ${sales.length}`, 10, yPosition);
      yPosition += 8;
      pdf.text(`Total Revenue: ₦${totalRevenue.toFixed(2)}`, 10, yPosition);
      yPosition += 8;
      pdf.text(`Average Order Value: ₦${averageOrderValue.toFixed(2)}`, 10, yPosition);

      pdf.save("sales-report.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  const printSales = () => {
    window.print();
  };

  if (
    !isAuthenticated ||
    (user?.role !== "admin" && user?.role !== "manager" && user?.role !== "salesgirl")
  ) {
    return null;
  }

  const handleGenerateReceipt = async (saleId: string) => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) {
      alert("Sale not found");
      return;
    }

    const product = products.find((p) => p.id === sale.productId);
    const salesPerson = users.find((u) => u.id === sale.salesPersonId);

    try {
      const jsPDF = (await import("jspdf")).default;
      const pdf = new jsPDF("p", "mm", "a4");

      // Set font
      pdf.setFont("helvetica", "normal");

      // Header
      pdf.setFontSize(20);
      pdf.text("Mr. TP", 105, 20, { align: "center" });

      pdf.setFontSize(12);
      pdf.text("Sales Receipt", 105, 30, { align: "center" });

      // Receipt details
      pdf.setFontSize(10);
      let yPosition = 50;

      pdf.text(`Receipt #: ${sale.id}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`Date: ${new Date(sale.date).toLocaleDateString()}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`Sales Person: ${salesPerson?.name || "Unknown"}`, 20, yPosition);
      yPosition += 20;

      // Product details
      pdf.setFontSize(12);
      pdf.text(`Product: ${product?.name || "Unknown"}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`Quantity: ${sale.quantity}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`Unit Price: ₦${sale.price.toFixed(2)}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`Payment Mode: ${sale.paymentMode}`, 20, yPosition);
      yPosition += 20;

      // Total
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Total: ₦${sale.total.toFixed(2)}`, 105, yPosition, { align: "center" });
      yPosition += 20;

      // Footer
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.text("Thank you for your business!", 105, yPosition, { align: "center" });

      // Save the PDF
      pdf.save(`receipt-${sale.id}.pdf`);
    } catch (error) {
      console.error("Error generating receipt:", error);
      alert("Error generating receipt. Please try again.");
    }
  };

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
      render: (value: number) => `₦${value.toFixed(2)}`,
    },
    {
      key: "total",
      label: "Total",
      render: (value: number) => `₦${value.toFixed(2)}`,
    },
    {
      key: "salesPersonId",
      label: "Sales Person",
      searchable: true,
      render: (value: string) => {
        const salesPerson = users.find((u) => u.id === value);
        return salesPerson?.name || "Unknown";
      },
    },
    {
      key: "date",
      label: "Date",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "paymentMode",
      label: "Payment Mode",
      render: (value: string) => value,
    },
    {
      key: "id",
      label: "Receipt",
      render: (value: string) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleGenerateReceipt(value)}
        >
          <Download className="w-4 h-4" />
        </Button>
      ),
    },
    ...(user?.role !== "salesgirl" ? [{
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
    }] : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Sidebar />

      {/* Main Content */}
      <main className="md:ml-64 p-4 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          {user?.role !== "salesgirl" && (
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="hover:bg-white/50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          )}
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              Sales Management
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Track and manage sales transactions
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={generatePDF}
              className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button
              onClick={printSales}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
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

                <div className="space-y-2">
                  <Label htmlFor="paymentMode">Payment Mode</Label>
                  <Select
                    value={formData.paymentMode}
                    onValueChange={(value: "POS" | "transfer" | "cash") =>
                      setFormData({ ...formData, paymentMode: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POS">POS</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.productId && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Total Amount
                    </p>
                    <p className="text-2xl font-bold">
                      ₦
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
                  ₦{totalRevenue.toFixed(0)}
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
                  ₦{averageOrderValue.toFixed(0)}
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
          <CardContent id="sales-table-container">
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



