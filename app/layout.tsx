import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Binocolo - Find Your Perfect Neighborhood",
  description: "Discover neighborhoods through honest reviews from real residents",
  icons: {
    icon: [
      {
        url: "/images/logo.png",
        href: "/images/logo.png",
      }
    ],
    apple: {
      url: "/images/logo.png",
      href: "/images/logo.png",
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <ClerkProvider>
        <body className="bg-gray-50 text-gray-900 antialiased">
          {children}
        </body>
      </ClerkProvider>
    </html>
  );
}
