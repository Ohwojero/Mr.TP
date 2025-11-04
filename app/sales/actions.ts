// app/sales/actions.ts
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { Product, Sale, User } from "@/lib/types";

export async function getSalesData() {
  const products: Product[] = db.prepare("SELECT * FROM products").all();
  const salesRaw: Sale[] = db
    .prepare(
      `SELECT s.*, p.name AS productName, u.name AS salesPersonName
       FROM sales s
       LEFT JOIN products p ON s.productId = p.id
       LEFT JOIN users u ON s.salesPersonId = u.id`
    )
    .all();

  const users: Pick<User, "id" | "name">[] = db
    .prepare("SELECT id, name FROM users")
    .all();

  const totalRevenue = salesRaw.reduce((s, v) => s + v.total, 0);
  const totalSales = salesRaw.length;
  const averageOrderValue = totalSales ? totalRevenue / totalSales : 0;

  return {
    products,
    sales: salesRaw,
    users,
    totalRevenue,
    totalSales,
    averageOrderValue,
  };
}

/** Add a sale + deduct stock (atomic) */
export async function addSaleAction(
  form: {
    productId: string;
    quantity: number;
    paymentMode: "POS" | "transfer" | "cash";
    salesPersonId: string;
  }
) {
  const product = db
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(form.productId) as Product;

  if (!product) throw new Error("Product not found");
  if (product.quantity < form.quantity)
    throw new Error("Insufficient stock");

  const total = product.price * form.quantity;
  const saleId = `sale-${Date.now()}`;

  db.transaction(() => {
    db.prepare(
      `INSERT INTO sales
       (id, productId, quantity, price, total, date, salesPersonId, paymentMode)
       VALUES (?,?,?,?,?,?,?,?)`
    ).run(
      saleId,
      form.productId,
      form.quantity,
      product.price,
      total,
      new Date().toISOString(),
      form.salesPersonId,
      form.paymentMode
    );

    db.prepare(
      "UPDATE products SET quantity = quantity - ? WHERE id = ?"
    ).run(form.quantity, form.productId);
  })();

  revalidatePath("/sales");
}

/** Delete a sale + restore stock */
export async function deleteSaleAction(saleId: string) {
  const sale = db
    .prepare("SELECT * FROM sales WHERE id = ?")
    .get(saleId) as Sale;

  if (!sale) throw new Error("Sale not found");

  db.transaction(() => {
    db.prepare("DELETE FROM sales WHERE id = ?").run(saleId);
    db.prepare(
      "UPDATE products SET quantity = quantity + ? WHERE id = ?"
    ).run(sale.quantity, sale.productId);
  })();

  revalidatePath("/sales");
}