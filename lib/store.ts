import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit"

// Types
export type UserRole = "admin" | "manager" | "salesgirl"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface Product {
  id: string
  name: string
  sku: string
  quantity: number
  reorderLevel: number
  price: number
  cost: number
  category: string
}

export interface Sale {
  id: string
  productId: string
  quantity: number
  price: number
  total: number
  date: string
  salesPersonId: string
  paymentMode: "POS" | "transfer" | "cash"
}

export interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
  createdBy: string
}

// Auth Slice
interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
    },
  },
})

// Products Slice
interface ProductsState {
  items: Product[]
}

const initialProductsState: ProductsState = {
  items: [
    {
      id: "1",
      name: "Laptop",
      sku: "LAP-001",
      quantity: 15,
      reorderLevel: 5,
      price: 1200,
      cost: 800,
      category: "Electronics",
    },
    {
      id: "2",
      name: "Mouse",
      sku: "MOU-001",
      quantity: 50,
      reorderLevel: 20,
      price: 25,
      cost: 10,
      category: "Accessories",
    },
    {
      id: "3",
      name: "Keyboard",
      sku: "KEY-001",
      quantity: 3,
      reorderLevel: 10,
      price: 75,
      cost: 40,
      category: "Accessories",
    },
  ],
}

const productsSlice = createSlice({
  name: "products",
  initialState: initialProductsState,
  reducers: {
    addProduct: (state, action: PayloadAction<Product>) => {
      state.items.push(action.payload)
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.items.findIndex((p) => p.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((p) => p.id !== action.payload)
    },
    updateStock: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const product = state.items.find((p) => p.id === action.payload.id)
      if (product) {
        product.quantity = action.payload.quantity
      }
    },
  },
})

// Sales Slice
interface SalesState {
  items: Sale[]
}

const initialSalesState: SalesState = {
  items: [
    {
      id: "1",
      productId: "1",
      quantity: 2,
      price: 1200,
      total: 2400,
      date: new Date().toISOString(),
      salesPersonId: "user2",
      paymentMode: "POS",
    },
  ],
}

const salesSlice = createSlice({
  name: "sales",
  initialState: initialSalesState,
  reducers: {
    addSale: (state, action: PayloadAction<Sale>) => {
      state.items.push(action.payload)
    },
    deleteSale: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((s) => s.id !== action.payload)
    },
  },
})

// Expenses Slice
interface ExpensesState {
  items: Expense[]
}

const initialExpensesState: ExpensesState = {
  items: [
    {
      id: "1",
      description: "Office supplies",
      amount: 150,
      category: "Supplies",
      date: new Date().toISOString(),
      createdBy: "user1",
    },
  ],
}

const expensesSlice = createSlice({
  name: "expenses",
  initialState: initialExpensesState,
  reducers: {
    addExpense: (state, action: PayloadAction<Expense>) => {
      state.items.push(action.payload)
    },
    deleteExpense: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((e) => e.id !== action.payload)
    },
  },
})

// Users Slice
interface UsersState {
  items: User[]
}

const initialUsersState: UsersState = {
  items: [
    {
      id: "user1",
      email: "admin@inventory.com",
      name: "Admin User",
      role: "admin",
    },
    {
      id: "user2",
      email: "manager@inventory.com",
      name: "Manager User",
      role: "manager",
    },
    {
      id: "user3",
      email: "sales@inventory.com",
      name: "Sales Girl",
      role: "salesgirl",
    },
  ],
}

const usersSlice = createSlice({
  name: "users",
  initialState: initialUsersState,
  reducers: {
    addUser: (state, action: PayloadAction<User>) => {
      state.items.push(action.payload)
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((u) => u.id !== action.payload)
    },
  },
})

// Store
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    products: productsSlice.reducer,
    sales: salesSlice.reducer,
    expenses: expensesSlice.reducer,
    users: usersSlice.reducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Actions
export const { login, logout } = authSlice.actions
export const { addProduct, updateProduct, deleteProduct, updateStock } = productsSlice.actions
export const { addSale, deleteSale } = salesSlice.actions
export const { addExpense, deleteExpense } = expensesSlice.actions
export const { addUser, deleteUser } = usersSlice.actions
