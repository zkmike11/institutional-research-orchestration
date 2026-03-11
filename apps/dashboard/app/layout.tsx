import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import Sidebar from "@/components/layout/Sidebar";
import { WatchlistProvider } from "@/contexts/WatchlistProvider";
import { ModalProvider } from "@/contexts/ModalProvider";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Markets Dashboard",
  description: "Cross-asset market surveillance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSerif.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ErrorBoundary>
          <WatchlistProvider>
            <ModalProvider>
              <div className="dashboard-layout">
                <Sidebar />
                <main className="main-content">{children}</main>
              </div>
            </ModalProvider>
          </WatchlistProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
