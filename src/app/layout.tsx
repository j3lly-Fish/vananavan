import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { MapsProvider } from "@/components/providers/maps-provider";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "sonner";
import { SessionProviderWrapper } from "@/components/providers/session-provider";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VanaNavan - School Bus Matching", // Using 'VanaNavan' as project name from path
  description: "Connect with private school bus drivers for safe, reliable transportation.",
};

import { auth } from "@/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={outfit.className}>
        <SessionProviderWrapper session={session}>
          <MapsProvider>
            <Navbar user={session?.user} />
            <main className="min-h-screen pt-16 bg-slate-50 dark:bg-slate-950">
              {children}
            </main>
            <Toaster />
          </MapsProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
