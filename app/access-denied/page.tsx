"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AccessDeniedPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-red-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin area. 
            This area is restricted to authorized administrators only.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link 
              href="/"
              className="bg-primary text-white py-2 px-4 rounded hover:bg-primary/90 transition text-center flex-1"
            >
              Return Home
            </Link>
            
            <button 
              onClick={() => router.back()}
              className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition flex-1"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 