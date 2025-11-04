// @ts-ignore
import Database from "better-sqlite3";
import { hash } from "bcrypt";
import path from "path";

const dbPath = path.resolve(process.cwd(), "data", "inventory.db");
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'manager', 'salesgirl'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    quantity INTEGER NOT NULL,
    reorderLevel INTEGER NOT NULL,
    price REAL NOT NULL,
    cost REAL NOT NULL,
    category TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    productId TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    total REAL NOT NULL,
    date TEXT NOT NULL,
    salesPersonId TEXT NOT NULL,
    paymentMode TEXT NOT NULL CHECK(paymentMode IN ('POS', 'transfer', 'cash')),
    FOREIGN KEY (productId) REFERENCES products(id),
    FOREIGN KEY (salesPersonId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    createdBy TEXT NOT NULL,
    FOREIGN KEY (createdBy) REFERENCES users(id)
  );
`);

// Seed ONLY the admin account
(async () => {
  const adminPassword = await hash("admin123", 10);

  const insertAdmin = db.prepare(`
    INSERT OR IGNORE INTO users (id, email, password, name, role)
    VALUES ('admin1', 'admin@inventory.com', ?, 'Admin User', 'admin')
  `);

  insertAdmin.run(adminPassword);
})();

export { db };