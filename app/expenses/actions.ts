// app/expenses/actions.ts
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  createdBy: string;
}

/** Load all expenses */
export async function getExpenses(): Promise<Expense[]> {
  return db.prepare("SELECT * FROM expenses ORDER BY date DESC").all();
}

/** Add a new expense */
export async function addExpense(data: {
  description: string;
  amount: number;
  category: string;
  createdBy: string;
}) {
  const id = `exp-${Date.now()}`;
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO expenses
     (id, description, amount, category, date, createdBy)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, data.description, data.amount, data.category, now, data.createdBy);

  revalidatePath("/expenses");
  return { id, ...data, date: now };
}

/** Delete an expense */
export async function deleteExpense(id: string) {
  db.prepare("DELETE FROM expenses WHERE id = ?").run(id);
  revalidatePath("/expenses");
}