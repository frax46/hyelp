"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { isAdminEmail, isAdminFeatureConfigured, getAdminEmails } from "../utils/adminAccess";
import Link from "next/link";
import { BarChart2, Users, Star, HelpCircle, MessageSquare, UserPlus } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import FormattedDate from "../components/FormattedDate";

interface DashboardStats {
  totalReviews: number;
  totalQuestions: number;
  totalUsers: number;
  reviewGrowthRate: number;
  userGrowthRate: number;
  averageRating: number;
}

interface RecentActivity {
  latestReview: any;
  latestAnswer: any;
  recentUser: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
  } | null;
}

interface TopAddress {
  id: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  formattedAddress: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    reviews: number;
  };
}

export default function AdminPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessCheckComplete, setAccessCheckComplete] = useState(false);
  const [error, setError] = useState<string>('');
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [topAddresses, setTopAddresses] = useState<TopAddress[]>([]);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!userId) {
      console.log("Redirecting to sign-in page - User not authenticated");
      const currentPath = window.location.pathname;
      router.push(`/sign-in?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    
    if (!isAdminFeatureConfigured()) {
      console.log("Admin feature not properly configured");
      console.log("Admin emails:", getAdminEmails());
      setError('Admin feature is not properly configured. No admin emails have been specified.');
      setIsLoading(false);
      setAccessCheckComplete(true);
      return;
    }
    
    const checkAdminAccess = async () => {
      try {
        const userInfo = await fetch('/api/auth/user-info');
        const userData = await userInfo.json();
        const userEmail = userData.email;
        
        console.log("Current user email:", userEmail);
        console.log("Admin emails allowed:", getAdminEmails());

        const adminStatus = isAdminEmail(userEmail);
        console.log("Is admin:", adminStatus);
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          setError('You do not have admin access. Redirecting to home page...');
          setIsLoading(false);
          setAccessCheckComplete(true);
          
          setTimeout(() => {
            router.push('/');
          }, 3000);
        }
        
        setAccessCheckComplete(true);
      } catch (error) {
        console.error("Error checking admin access:", error);
        setError('Could not verify admin access. Please try again later.');
        setIsLoading(false);
        setAccessCheckComplete(true);
      }
    };
    
    checkAdminAccess();
  }, [isLoaded, userId, router]);

  useEffect(() => {
    if (!accessCheckComplete || !isAdmin) return;
    
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard');
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch dashboard data: ${errorText}`);
        }
        
        const data = await response.json();
        console.log("Dashboard data:", data);
        
        setStats(data.statistics);
        setRecentActivity(data.recentActivity);
        setTopAddresses(data.topAddresses);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError('Failed to load dashboard data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAdmin, accessCheckComplete]);

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Loading Admin Dashboard</h1>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Access Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Reviews" 
          value={stats?.totalReviews || 0} 
          trend={stats?.reviewGrowthRate || 0} 
          icon={<BarChart2 className="h-8 w-8 text-primary" />} 
        />
        <StatCard 
          title="Total Users" 
          value={stats?.totalUsers || 0} 
          trend={stats?.userGrowthRate || 0} 
          icon={<Users className="h-8 w-8 text-primary" />} 
        />
        <StatCard 
          title="Average Rating" 
          value={stats?.averageRating?.toFixed(1) || "0.0"} 
          trend={0} 
          icon={<Star className="h-8 w-8 text-primary" />} 
          valuePrefix="" 
        />
        <StatCard 
          title="Active Questions" 
          value={stats?.totalQuestions || 0} 
          trend={0} 
          icon={<HelpCircle className="h-8 w-8 text-primary" />} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
            {recentActivity?.latestReview && (
              <ActivityItem 
                title="Latest Review" 
                subtitle={recentActivity.latestReview.address.formattedAddress}
                time={recentActivity.latestReview.createdAt}
                icon={<Star className="h-6 w-6 text-amber-500" />}
              />
            )}
            {recentActivity?.latestAnswer && (
              <ActivityItem 
                title="Latest Question Answer" 
                subtitle={recentActivity.latestAnswer.question.text}
                time={recentActivity.latestAnswer.createdAt}
                icon={<MessageSquare className="h-6 w-6 text-blue-500" />}
              />
            )}
            {recentActivity?.recentUser && (
              <ActivityItem 
                title="New User Joined" 
                subtitle={recentActivity.recentUser.email}
                time={recentActivity.recentUser.createdAt}
                icon={<UserPlus className="h-6 w-6 text-green-500" />}
              />
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Top Addresses</h2>
          <div className="bg-white rounded-lg shadow-md p-4">
            {topAddresses.length > 0 ? (
              <div className="space-y-4">
                {topAddresses.map((address) => (
                  <div key={address.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                    <h3 className="font-medium">{address.formattedAddress}</h3>
                    <p className="text-sm text-gray-600">
                      {address._count.reviews} {address._count.reviews === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No address data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  trend: number;
  icon: React.ReactNode;
  valuePrefix?: string;
}

function StatCard({ title, value, trend, icon, valuePrefix = "" }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{valuePrefix}{value}</p>
        </div>
        {icon}
      </div>
      {trend !== 0 && (
        <div className={`flex items-center mt-2 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span className="text-sm ml-1">{Math.abs(trend)}% {trend > 0 ? 'increase' : 'decrease'}</span>
        </div>
      )}
    </div>
  );
}

interface ActivityItemProps {
  title: string;
  subtitle: string;
  time: string;
  icon: React.ReactNode;
}

function ActivityItem({ title, subtitle, time, icon }: ActivityItemProps) {
  return (
    <div className="flex items-start space-x-3">
      <div className="bg-gray-100 p-2 rounded-full">{icon}</div>
      <div className="flex-1">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-gray-600">{subtitle}</p>
        <p className="text-xs text-gray-500 mt-1">
          <FormattedDate dateString={time} format="relative" />
        </p>
      </div>
    </div>
  );
} 