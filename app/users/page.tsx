"use client";

import { Sidebar } from "@/components/sidebar";

import type React from "react";

import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type RootState, logout, addUser, deleteUser } from "@/lib/store";
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
import { Plus, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { ArrowLeft } from "lucide-react";

export default function UsersPage() {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { items: users } = useSelector((state: RootState) => state.users);
  const dispatch = useDispatch();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "manager" as const,
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.name) return;

    const newUser = {
      id: `user-${Date.now()}`,
      email: formData.email,
      name: formData.name,
      role: formData.role,
    };

    dispatch(addUser(newUser));
    setFormData({ email: "", name: "", role: "manager" });
    setIsOpen(false);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === user?.id) {
      alert("Cannot delete your own account");
      return;
    }
    dispatch(deleteUser(userId));
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  const tableColumns = [
    {
      key: "name",
      label: "Name",
      searchable: true,
    },
    {
      key: "email",
      label: "Email",
      searchable: true,
    },
    {
      key: "role",
      label: "Role",
      searchable: true,
      render: (value: string) => (
        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
          {value}
        </span>
      ),
    },
    {
      key: "id",
      label: "Actions",
      render: (value: string) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteUser(value)}
          disabled={value === user?.id}
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Sidebar />

      {/* Main Content */}
      <main className="md:ml-64 p-4 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="hover:bg-white/50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              User Management
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage system users and their roles
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with assigned role
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="salesgirl">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full">
                  Create User
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users Table with Pagination and Search */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              All Users
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
              Total users:{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {users.length}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={tableColumns}
              data={users}
              itemsPerPage={10}
              searchPlaceholder="Search by name or email..."
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
