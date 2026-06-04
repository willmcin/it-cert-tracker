import type { Metadata } from "next";
import { Michroma, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import NavLinks from "@/components/NavLinks";
import StatusBar from "@/components/StatusBar";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

const michroma = Michroma({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-michroma",
  display: "swap",
});

const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CERTCOM // Mission Control",
  description: "Personal IT certification roadmap and study tracker",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CERTCOM",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${michroma.variable} ${plex.variable} antialiased`}>
        <header className="sticky top-0 z-40 flex items-center gap-5 px-6 py-3.5 border-b border-line bg-bg/85 backdrop-blur-md text-[11px] uppercase tracking-[0.18em]">
          <Link href="/" className="flex items-center gap-3 font-display text-[15px] tracking-[0.28em] text-amber" style={{ textShadow: "var(--glow-amber)" }}>
            <span className="w-2 h-2 rounded-full bg-cyan mc-dot" style={{ boxShadow: "var(--glow-cyan)" }} />
            CERTCOM
          </Link>
          <NavLinks />
          <div className="flex-1" />
          <StatusBar />
        </header>

        <ServiceWorkerRegister />
        <main className="px-6 py-10 max-w-5xl mx-auto">{children}</main>

        <footer className="border-t border-line px-6 py-4 flex justify-between flex-wrap gap-2 text-[10px] uppercase tracking-[0.2em] text-faint">
          <span>CERTCOM v2.6 // TELEMETRY UPLINK <span className="mc-blink text-cyan">▮</span></span>
          <span>localStorage // no backend · offline-ready</span>
        </footer>
      </body>
    </html>
  );
}
