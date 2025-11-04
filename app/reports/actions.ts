// app/reports/actions.ts
"use server";

import { db } from "@/lib/db";

export interface Product {
  id: string;
  name: string;
  quantity: number;
  reorderLevel: number;
  cost: number;
  price: number;
}
export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  total: number;
}
export interface Expense {
  id: string;
  amount: number;
  category: string;
}

/** Load all products */
export async function getProducts(): Promise<Product[]> {
  return db.prepare("SELECT * FROM products").all() as Product[];
}

/** Load all sales */
export async function getSales(): Promise<Sale[]> {
  return db.prepare("SELECT * FROM sales").all() as Sale[];
}

/** Load all expenses */
export async function getExpenses(): Promise<Expense[]> {
  return db.prepare("SELECT * FROM expenses").all() as Expense[];
}