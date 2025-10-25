"use client"

import type React from "react"

import { useState } from "react"
import { useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { login } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch()
  const router = useRouter()

  // Demo users for testing
  const demoUsers = [
    { email: "admin@inventory.com", password: "admin123", id: "user1", name: "Admin User", role: "admin" as const },
    {
      email: "manager@inventory.com",
      password: "manager123",
      id: "user2",
      name: "Manager User",
      role: "manager" as const,
    },
    { email: "sales@inventory.com", password: "sales123", id: "user3", name: "Sales Girl", role: "salesgirl" as const },
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Find matching demo user
      const user = demoUsers.find((u) => u.email === email && u.password === password)

      if (!user) {
        setError("Invalid email or password. Try admin@inventory.com / admin123")
        setIsLoading(false)
        return
      }

      // Dispatch login action
      dispatch(login({ id: user.id, email: user.email, name: user.name, role: user.role }))

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (err) {
      setError("An error occurred during login")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Inventory Management</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@inventory.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
              <p className="font-semibold mb-2">Demo Credentials:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>Admin: admin@inventory.com / admin123</li>
                <li>Manager: manager@inventory.com / manager123</li>
                <li>Sales: sales@inventory.com / sales123</li>
              </ul>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
