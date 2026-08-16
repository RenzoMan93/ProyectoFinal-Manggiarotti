import { IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import MessageNotifier from "@/components/MessageNotifier";
import SupabaseSetupNeeded from "@/components/SupabaseSetupNeeded";
import { supabaseConfigured } from "@/lib/supabase/config";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["500", "600"],
});

export const metadata = {
  title: "Trueke — Compra y venta de segunda mano en Uruguay",
  description: "Marketplace de artículos de segunda mano para Uruguay.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {supabaseConfigured ? (
          <>
            <MessageNotifier />
            <Header />
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 sm:pb-6">{children}</main>
            <footer className="hidden border-t border-line py-5 text-center text-xs text-muted sm:block">
              Trueke · Compra y venta de segunda mano en Uruguay
              <br />
              © {new Date().getFullYear()} Renzo Manggiarotti. Todos los derechos reservados.
            </footer>
            <BottomNav />
          </>
        ) : (
          <SupabaseSetupNeeded />
        )}
      </body>
    </html>
  );
}
