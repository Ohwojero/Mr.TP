// app/dashboard/actions.ts
'use server';

import { db } from '@/lib/db';
import type { Product, Sale, Expense } from '@/lib/types';

export async function getDashboardData() {
  const products: Product[] = db.prepare('SELECT * FROM products').all();
  const sales: Sale[] = db.prepare('SELECT * FROM sales').all();
  const expenses: Expense[] = db.prepare('SELECT * FROM expenses').all();

  const totalRevenue = sales.reduce((s, v) => s + v.total, 0);
  const totalExpenses = expenses.reduce((s, v) => s + v.amount, 0);
  const lowStock = products.filter(p => p.quantity <= p.reorderLevel).length;

  return {
    products,
    sales,
    expenses,
    stats: {
      totalProducts: products.length,
      totalRevenue,
      totalExpenses,
      profit: totalRevenue - totalExpenses,
      lowStock,
    },
  };
}