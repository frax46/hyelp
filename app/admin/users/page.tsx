"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { isAdminEmail } from "@/app/utils/adminAccess";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// Define user types for both Clerk users and local app users
type ClerkUser = {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  createdAt: string;
  lastSignInAt?: string;
};

type LocalUser = {
  id: string;
  userId: string;
  email: string;
  name?: string;
  role: string;
  createdAt: string;
  reviews: number;
};

export default function AdminUsersPage() {
  const { userId, getToken } = useAuth();
  const router = useRouter();
  
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [clerkUsers, setClerkUsers] = useState<ClerkUser[]>([]);
  const [localUsers, setLocalUsers] = useState<LocalUser[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();
        
        if (!data.email || !isAdminEmail(data.email)) {
          router.push("/");
          return;
        }
        
        setIsAdmin(true);
        fetchUsers();
      } catch (error) {
        console.error("Error checking admin status:", error);
        router.push("/");
      }
    };
    
    checkAdmin();
  }, [router, userId]);
  
  // Fetch users from Clerk and our database
  const fetchUsers = async () => {
    setIsLoading(true);
    
    try {
      // Fetch users from our API that combines Clerk users with our DB data
      const response = await fetch("/api/admin/users");
      
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      
      const data = await response.json();
      
      if (data.clerkUsers) {
        setClerkUsers(data.clerkUsers);
      }
      
      if (data.localUsers) {
        setLocalUsers(data.localUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter users based on search term
  const filteredClerkUsers = clerkUsers.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredLocalUsers = localUsers.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle user deletion (we'll mark as inactive rather than delete)
  const handleDeactivateUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to deactivate this user? This will prevent them from logging in.")) {
      try {
        const response = await fetch(`/api/admin/users/${userId}/deactivate`, {
          method: "PUT",
        });
        
        if (!response.ok) {
          throw new Error("Failed to deactivate user");
        }
        
        // Refresh user list
        fetchUsers();
      } catch (error) {
        console.error("Error deactivating user:", error);
      }
    }
  };
  
  // Handle making a user an admin
  const handleMakeAdmin = async (userId: string, email: string) => {
    if (window.confirm(`Are you sure you want to make ${email} an admin? This will give them full access to the admin panel.`)) {
      try {
        const response = await fetch(`/api/admin/users/${userId}/make-admin`, {
          method: "PUT",
        });
        
        if (!response.ok) {
          throw new Error("Failed to make user an admin");
        }
        
        // Refresh user list
        fetchUsers();
      } catch (error) {
        console.error("Error making user an admin:", error);
      }
    }
  };
  
  // Format date string
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Checking admin privileges...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Link href="/admin">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>User Search</CardTitle>
          <CardDescription>
            Search for users by email, name, or username
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Button onClick={fetchUsers}>Refresh</Button>
          </div>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="text-center py-8">Loading users...</div>
      ) : (
        <>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Application Users ({filteredClerkUsers.length})</CardTitle>
              <CardDescription>
                Users registered through Clerk authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Sign In</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClerkUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClerkUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {user.imageUrl && (
                                <img
                                  src={user.imageUrl}
                                  alt={user.username || user.email}
                                  className="w-8 h-8 rounded-full"
                                />
                              )}
                              <div>
                                {user.firstName && user.lastName 
                                  ? `${user.firstName} ${user.lastName}`
                                  : user.username || user.email.split('@')[0]
                                }
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell>
                            {user.lastSignInAt 
                              ? formatDate(user.lastSignInAt)
                              : "Never"
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMakeAdmin(user.id, user.email)}
                              >
                                Make Admin
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeactivateUser(user.id)}
                              >
                                Deactivate
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Local Users ({filteredLocalUsers.length})</CardTitle>
              <CardDescription>
                Users with additional data in our database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name/Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Reviews</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLocalUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No local user records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLocalUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.name || "No name"}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${
                              user.role === "admin" 
                                ? "bg-purple-100 text-purple-800" 
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {user.role}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell>{user.reviews}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/admin/users/${user.userId}`)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 