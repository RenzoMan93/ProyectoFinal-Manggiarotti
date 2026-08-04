import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import SupabaseSetupNeeded from "@/components/SupabaseSetupNeeded";
import { supabaseConfigured } from "@/lib/supabase/config";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "ReUsalo — Compra y venta de segunda mano en Uruguay",
  description: "Marketplace de artículos de segunda mano para Uruguay.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {supabaseConfigured ? (
          <>
            <Header />
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
            <footer className="border-t border-gray-200 py-5 text-center text-xs text-gray-400">
              ReUsalo · Compra y venta de segunda mano en Uruguay
            </footer>
          </>
        ) : (
          <SupabaseSetupNeeded />
        )}
      </body>
    </html>
  );
}
