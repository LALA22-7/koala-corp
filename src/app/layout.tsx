import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import { AppProvider } from "@/lib/store";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Koala Corp. — AI Workforce OS",
  description: "The operating layer for AI-assisted business work. Monitor workflows, review outputs, and manage your digital workforce.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <AppProvider>
          <Suspense fallback={<div className="min-h-screen bg-warm-paper" />}>
            <AppShell>{children}</AppShell>
          </Suspense>
        </AppProvider>
      </body>
    </html>
  );
}
