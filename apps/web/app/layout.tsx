import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import Header from "@/components/layout/Header";
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
  title: "Markets, Inc.",
  description: "Investment Committee",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSerif.variable}`}>
      <body>
        <Header />
        <main style={{ padding: "24px 0" }}>
          <div className="container">{children}</div>
        </main>
      </body>
    </html>
  );
}
