import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import NavLinks from "@/components/NavLinks";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IT Cert Tracker",
  description: "Personal IT certification roadmap and study tracker",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-950 text-gray-100 min-h-screen`}>
        <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-white tracking-tight">
            IT Cert Tracker
          </Link>
          <NavLinks />
        </header>
        <ServiceWorkerRegister />
        <main className="px-6 py-8 max-w-5xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
