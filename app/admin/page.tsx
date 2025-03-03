"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { isAdminEmail, isAdminFeatureConfigured } from "../utils/adminAccess";

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is loaded
    if (!isLoaded) return;

    // If no user is authenticated, redirect to sign-in
    if (!user) {
      router.push("/sign-in");
      return;
    }

    // Check if admin feature is configured
    const adminConfigured = isAdminFeatureConfigured();
    setIsConfigured(adminConfigured);

    if (!adminConfigured) {
      console.error("Admin feature is not configured properly");
      return;
    }

    // Get the user's primary email address
    const userEmail = user.primaryEmailAddress?.emailAddress;
    
    // Check if the user's email is in the admin list
    const hasAdminAccess = isAdminEmail(userEmail);
    setIsAdmin(hasAdminAccess);

    // Redirect to home if not an admin
    if (!hasAdminAccess) {
      router.push("/");
    }
  }, [user, isLoaded, router]);

  // Show loading state
  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Checking your permissions...</p>
      </div>
    );
  }

  // Show configuration error
  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="mb-4">
            The admin feature is not configured properly. Please make sure the NEXT_PUBLIC_ADMIN_EMAILS
            environment variable is set with a list of admin email addresses.
          </p>
        </div>
      </div>
    );
  }

  // Only render the admin content if the user is an admin
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, Admin!</h2>
        <p className="mb-4">
          You have access to this page because your email ({user?.primaryEmailAddress?.emailAddress}) 
          is in the admin allowlist.
        </p>
        
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-3">Admin Controls</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Example admin controls */}
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-md p-3 transition"
              aria-label="Manage Users"
            >
              Manage Users
            </button>
            <button 
              className="bg-green-600 hover:bg-green-700 text-white rounded-md p-3 transition"
              aria-label="View Reports"
            >
              View Reports
            </button>
            <button 
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-md p-3 transition"
              aria-label="System Settings"
            >
              System Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 