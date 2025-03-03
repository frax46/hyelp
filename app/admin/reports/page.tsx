"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { isAdminEmail } from "@/app/utils/adminAccess";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Define types for our reports data
type SummaryStats = {
  totalReviews: number;
  totalUsers: number;
  totalAddresses: number;
  averageRating: number;
};

type CityStats = {
  city: string;
  reviewCount: number;
  averageRating: number;
};

type CategoryStats = {
  category: string;
  averageScore: number;
  questionCount: number;
};

type MonthlyStats = {
  month: string;
  reviewCount: number;
  averageRating: number;
};

export default function AdminReportsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [cityStats, setCityStats] = useState<CityStats[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  
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
        fetchReportData();
      } catch (error) {
        console.error("Error checking admin status:", error);
        router.push("/");
      }
    };
    
    checkAdmin();
  }, [router, userId]);
  
  // Fetch report data
  const fetchReportData = async () => {
    setIsLoading(true);
    
    try {
      // For this example, we'll generate sample data
      // In a real app, you would fetch this from your API
      
      // Sample summary statistics
      setSummaryStats({
        totalReviews: 157,
        totalUsers: 89,
        totalAddresses: 112,
        averageRating: 4.2,
      });
      
      // Sample city statistics
      setCityStats([
        { city: "New York", reviewCount: 42, averageRating: 4.1 },
        { city: "Los Angeles", reviewCount: 31, averageRating: 3.8 },
        { city: "Chicago", reviewCount: 28, averageRating: 4.3 },
        { city: "Houston", reviewCount: 21, averageRating: 4.0 },
        { city: "Philadelphia", reviewCount: 15, averageRating: 4.5 },
      ]);
      
      // Sample category statistics
      setCategoryStats([
        { category: "Cleanliness", averageScore: 4.6, questionCount: 157 },
        { category: "Responsiveness", averageScore: 3.9, questionCount: 157 },
        { category: "Value", averageScore: 4.1, questionCount: 157 },
        { category: "Maintenance", averageScore: 3.7, questionCount: 157 },
        { category: "Communication", averageScore: 4.4, questionCount: 157 },
      ]);
      
      // Sample monthly statistics
      setMonthlyStats([
        { month: "January", reviewCount: 12, averageRating: 4.1 },
        { month: "February", reviewCount: 15, averageRating: 4.0 },
        { month: "March", reviewCount: 18, averageRating: 4.2 },
        { month: "April", reviewCount: 21, averageRating: 4.3 },
        { month: "May", reviewCount: 25, averageRating: 4.1 },
        { month: "June", reviewCount: 28, averageRating: 4.0 },
      ]);
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setIsLoading(false);
    }
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
        <p>Loading report data...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <Link href="/admin">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
      
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summaryStats?.totalReviews}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summaryStats?.totalUsers}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summaryStats?.totalAddresses}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summaryStats?.averageRating.toFixed(1)}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* City Statistics */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Reviews by City</CardTitle>
          <CardDescription>
            Distribution of reviews and ratings across cities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">City</th>
                  <th className="text-left py-2">Reviews</th>
                  <th className="text-left py-2">Average Rating</th>
                </tr>
              </thead>
              <tbody>
                {cityStats.map((city) => (
                  <tr key={city.city} className="border-b">
                    <td className="py-2">{city.city}</td>
                    <td className="py-2">{city.reviewCount}</td>
                    <td className="py-2">{city.averageRating.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Category Statistics */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Ratings by Category</CardTitle>
          <CardDescription>
            Average scores for each question category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Category</th>
                  <th className="text-left py-2">Average Score</th>
                  <th className="text-left py-2">Questions</th>
                </tr>
              </thead>
              <tbody>
                {categoryStats.map((category) => (
                  <tr key={category.category} className="border-b">
                    <td className="py-2">{category.category}</td>
                    <td className="py-2">{category.averageScore.toFixed(1)}</td>
                    <td className="py-2">{category.questionCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Monthly Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Review Activity</CardTitle>
          <CardDescription>
            Review count and average ratings by month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Month</th>
                  <th className="text-left py-2">Reviews</th>
                  <th className="text-left py-2">Average Rating</th>
                </tr>
              </thead>
              <tbody>
                {monthlyStats.map((month) => (
                  <tr key={month.month} className="border-b">
                    <td className="py-2">{month.month}</td>
                    <td className="py-2">{month.reviewCount}</td>
                    <td className="py-2">{month.averageRating.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Note: This report contains sample data for demonstration purposes.</p>
        <p>In a production application, this would display real analytics from your database.</p>
      </div>
    </div>
  );
} 