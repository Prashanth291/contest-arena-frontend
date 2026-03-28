import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { AuthProvider } from "@/lib/auth";
import { ToastContainer } from "./components/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ContestArena — Competitive Programming Platform",
  description:
    "Real-time competitive programming platform with live leaderboards, code execution, and Codeforces-style scoring. Create, join, and compete in programming contests.",
  keywords: [
    "competitive programming",
    "coding contest",
    "leaderboard",
    "code editor",
    "programming challenges",
  ],
  authors: [{ name: "ContestArena" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <AuthProvider>
          <Navbar />
          <div className="page-wrapper">
            {children}
          </div>
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
