import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { getCurrentUser } from "@/lib/auth";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const SITE_URL = rawSiteUrl && rawSiteUrl !== "" 
  ? rawSiteUrl 
  : process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "The Free Things Market — Nothing for sale. Everything to give.",
    template: "%s · The Free Things Market",
  },
  description:
    "A place to give what you have, ask for what you need, and keep generosity moving. No prices. No payments. Just people sharing.",
  openGraph: {
    title: "The Free Things Market",
    description: "Nothing for sale. Everything to give.",
    url: SITE_URL,
    siteName: "The Free Things Market",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={`${anton.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col">
        <SiteNav user={user} />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}