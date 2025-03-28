import type { Metadata } from "next";
import Link from "next/link";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { Montserrat, Poppins } from "next/font/google";

export const metadata: Metadata = {
  title: "Admin Dashboard - binocolo",
  description: "Admin section of binocolo",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <SignedIn>
        {/* Admin Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-2xl font-bold text-blue-600 font-montserrat">
                  <h1 className="text-xl md:text-2xl font-bold text-white flex items-center">
                    <span className="mr-2">🌍</span> binocolo
                  </h1>
                </Link>
              </div>
              <nav>
                <ul className="flex space-x-6">
                  <li>
                    <Link 
                      href="/admin" 
                      className="text-gray-600 hover:text-blue-600 font-medium"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/admin/reviews" 
                      className="text-gray-600 hover:text-blue-600 font-medium"
                    >
                      Reviews
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/admin/questions" 
                      className="text-gray-600 hover:text-blue-600 font-medium"
                    >
                      Questions
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-grow bg-gray-50">
          {children}
        </main>
        
        {/* Admin Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-500">
          <div className="container mx-auto px-4">
            <p>© <span suppressHydrationWarning>{new Date().getFullYear()}</span> binocolo Admin Panel. All rights reserved.</p>
          </div>
        </footer>
      </SignedIn>
      <SignedOut>
        {/* Redirect to sign-in if the user is signed out */}
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
} 