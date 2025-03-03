"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { isAdminEmail, isAdminFeatureConfigured } from "../utils/adminAccess";
import Link from "next/link";

interface DashboardStats {
  totalReviews: number;
  reviewGrowthRate: number;
  totalUsers: number;
  userGrowthRate: number;
  averageRating: number;
  ratingTrend: 'up' | 'down' | 'stable';
  activeQuestions: number;
  newQuestionsThisMonth: number;
}

interface RecentActivity {
  latestReview: {
    id: string;
    createdAt: string;
    address: {
      id: string;
      streetAddress: string;
      city: string;
      state: string;
    };
  } | null;
  latestUser: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
  } | null;
  latestQuestion: {
    id: string;
    text: string;
    category: string;
    updatedAt: string;
  } | null;
}

interface TopAddress {
  id: string;
  address: string;
  city: string;
  reviewCount: number;
  averageRating: number;
}

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [topAddresses, setTopAddresses] = useState<TopAddress[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch dashboard data
  useEffect(() => {
    if (isAdmin === true) {
      fetchDashboardData();
    }
  }, [isAdmin]);
  
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/dashboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      setStats(data.statistics);
      setRecentActivity(data.recentActivity);
      setTopAddresses(data.topAddresses);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

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

  // Show loading state for dashboard data
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.firstName || user?.username || 'Admin'}. Loading dashboard data...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-pulse">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-100 h-32"></div>
          <div className="bg-white rounded-lg shadow p-6 border border-gray-100 h-32"></div>
          <div className="bg-white rounded-lg shadow p-6 border border-gray-100 h-32"></div>
          <div className="bg-white rounded-lg shadow p-6 border border-gray-100 h-32"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.firstName || user?.username || 'Admin'}.
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-2"
            onClick={fetchDashboardData}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Only render the admin content if the user is an admin and data is loaded
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {user?.firstName || user?.username || 'Admin'}. Here's an overview of your system.
        </p>
      </div>
      
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Reviews</p>
              <h3 className="text-3xl font-bold mt-1">{stats?.totalReviews || 0}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            {stats?.reviewGrowthRate !== undefined && (
              <p className={`${stats.reviewGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'} text-sm`}>
                {stats.reviewGrowthRate >= 0 ? '+' : ''}{stats.reviewGrowthRate}% from last month
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Users</p>
              <h3 className="text-3xl font-bold mt-1">{stats?.totalUsers || 0}</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            {stats?.userGrowthRate !== undefined && (
              <p className={`${stats.userGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'} text-sm`}>
                {stats.userGrowthRate >= 0 ? '+' : ''}{stats.userGrowthRate}% from last month
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Avg. Rating</p>
              <h3 className="text-3xl font-bold mt-1">{stats?.averageRating || 0}</h3>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            {stats?.ratingTrend && (
              <p className={`${stats.ratingTrend === 'up' ? 'text-green-600' : (stats.ratingTrend === 'down' ? 'text-red-600' : 'text-gray-600')} text-sm`}>
                {stats.ratingTrend === 'stable' 
                  ? 'Stable from last month' 
                  : (stats.ratingTrend === 'up' ? 'Up from last month' : 'Down from last month')
                }
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Questions</p>
              <h3 className="text-3xl font-bold mt-1">{stats?.activeQuestions || 0}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            {stats?.newQuestionsThisMonth !== undefined && (
              <p className="text-green-600 text-sm">
                +{stats.newQuestionsThisMonth} new this month
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <Link href="/admin/reports" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivity?.latestReview && (
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium">New review submitted</p>
                  <p className="text-sm text-gray-500">
                    {recentActivity.latestReview.address.streetAddress}, {recentActivity.latestReview.address.city}, {recentActivity.latestReview.address.state}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(recentActivity.latestReview.createdAt)}</p>
                </div>
              </div>
            )}
            
            {recentActivity?.latestUser && (
              <div className="flex items-start">
                <div className="bg-purple-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium">New user registered</p>
                  <p className="text-sm text-gray-500">{recentActivity.latestUser.email}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(recentActivity.latestUser.createdAt)}</p>
                </div>
              </div>
            )}
            
            {recentActivity?.latestQuestion && (
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Question updated</p>
                  <p className="text-sm text-gray-500">{recentActivity.latestQuestion.category} category</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(recentActivity.latestQuestion.updatedAt)}</p>
                </div>
              </div>
            )}
            
            {!recentActivity?.latestReview && !recentActivity?.latestUser && !recentActivity?.latestQuestion && (
              <p className="text-gray-500">No recent activity to display.</p>
            )}
          </div>
        </div>
        
        {/* Admin Controls */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <h2 className="text-xl font-bold mb-4">Admin Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            
            <Link href="/admin/questions" className="block">
              <div className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg p-4 transition flex items-center justify-between">
                <span className="font-medium">Manage Questions</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Top Rated Addresses</h2>
          <Link href="/admin/reports" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All Reports
          </Link>
        </div>
        
        {topAddresses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviews</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topAddresses.map((address) => (
                  <tr key={address.id}>
                    <td className="px-4 py-3 whitespace-nowrap">{address.address}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{address.city}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{address.reviewCount}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-green-600 font-medium mr-2">{address.averageRating}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${star <= Math.round(address.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No address data available yet.</p>
        )}
      </div>
    </div>
  );
} 