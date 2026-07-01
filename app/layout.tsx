import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AGFitDashboard",
  description: "Dashboard fitness personnel alimenté par export Samsung Health",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <nav className="bg-white border-b border-gray-200 px-6 py-4 flex gap-6">
          <span className="font-semibold">AGFitDashboard</span>
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            Dashboard
          </Link>
          <Link href="/import" className="text-gray-600 hover:text-gray-900">
            Import
          </Link>
          <Link href="/goals" className="text-gray-600 hover:text-gray-900">
            Objectifs
          </Link>
        </nav>
        <main className="flex-1 p-6">{children}</main>
      </body>
    </html>
  );
}
