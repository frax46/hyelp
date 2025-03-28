"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { isAdminEmail } from "@/app/utils/adminAccess";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// Define types for our settings
type SystemSettings = {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  enableReviews: boolean;
  requireApproval: boolean;
  defaultReviewLimit: number;
  anonymousReviews: boolean;
};

export default function AdminSettingsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: "binocolo",
    siteDescription: "Find your perfect neighborhood",
    contactEmail: "binocoloapp@gmail.com",
    enableReviews: true,
    requireApproval: false,
    defaultReviewLimit: 10,
    anonymousReviews: true,
  });
  const [formChanged, setFormChanged] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  
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
        fetchSettings();
      } catch (error) {
        console.error("Error checking admin status:", error);
        router.push("/");
      }
    };
    
    checkAdmin();
  }, [router, userId]);
  
  // Fetch settings
  const fetchSettings = async () => {
    setIsLoading(true);
    
    try {
      // In a real app, you would fetch this from your API
      // For this example, we'll use the default settings
      
      // Simulate API call
      setTimeout(() => {
        setSettings({
          siteName: "binocolo",
          siteDescription: "Find your perfect neighborhood",
          contactEmail: "binocoloapp@gmail.com",
          enableReviews: true,
          requireApproval: false,
          defaultReviewLimit: 10,
          anonymousReviews: true,
        });
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setIsLoading(false);
    }
  };
  
  // Handle input changes
  const handleInputChange = (field: keyof SystemSettings, value: string | boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setFormChanged(true);
    
    // Clear success message when form changes
    if (successMessage) {
      setSuccessMessage("");
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // In a real app, you would send this to your API
      // For this example, we'll just simulate an API call
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage("Settings saved successfully!");
      setFormChanged(false);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Reset form to previous values
  const handleReset = () => {
    fetchSettings();
    setFormChanged(false);
    setSuccessMessage("");
  };
  
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Checking admin privileges...</p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading settings...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">System Settings</h1>
        <Link href="/admin">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Site Settings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Site Configuration</CardTitle>
            <CardDescription>
              Basic settings for the website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="siteName" className="block text-sm font-medium mb-1">
                Site Name
              </label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => handleInputChange("siteName", e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="siteDescription" className="block text-sm font-medium mb-1">
                Site Description
              </label>
              <Input
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => handleInputChange("siteDescription", e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium mb-1">
                Contact Email
              </label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleInputChange("contactEmail", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Review Settings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Review Settings</CardTitle>
            <CardDescription>
              Configure how reviews work on the site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <input
                id="enableReviews"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={settings.enableReviews}
                onChange={(e) => handleInputChange("enableReviews", e.target.checked)}
              />
              <label htmlFor="enableReviews" className="ml-2 block text-sm font-medium">
                Enable Reviews
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="requireApproval"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={settings.requireApproval}
                onChange={(e) => handleInputChange("requireApproval", e.target.checked)}
              />
              <label htmlFor="requireApproval" className="ml-2 block text-sm font-medium">
                Require Admin Approval for Reviews
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="anonymousReviews"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={settings.anonymousReviews}
                onChange={(e) => handleInputChange("anonymousReviews", e.target.checked)}
              />
              <label htmlFor="anonymousReviews" className="ml-2 block text-sm font-medium">
                Allow Anonymous Reviews
              </label>
            </div>
            
            <div>
              <label htmlFor="defaultReviewLimit" className="block text-sm font-medium mb-1">
                Default Review Limit (per page)
              </label>
              <Input
                id="defaultReviewLimit"
                type="number"
                min="1"
                max="100"
                value={settings.defaultReviewLimit}
                onChange={(e) => handleInputChange("defaultReviewLimit", parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Actions */}
        <div className="flex items-center justify-between">
          <div>
            {successMessage && (
              <p className="text-green-600">{successMessage}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={!formChanged || isSaving}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={!formChanged || isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
      
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Note: These settings are for demonstration purposes.</p>
        <p>In a production application, these would be saved to your database.</p>
      </div>
    </div>
  );
} 