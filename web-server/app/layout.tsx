import "./globals.css";
import "@/public/css/common.css";
import "@/public/css/menu-button.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import { AlertProvider } from "@/components/Alert";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI-Agent based Copilot",
  description:
    "Sally Suite, your AI-Agent based Copilot designed to boost productivity and streamline workflows. Seamlessly integrating with Google Workspace and Microsoft Office, our tool offers intelligent data analysis, enhanced writing assistance, and automated presentation generation.",
  keywords: [
    "sheet chat",
    "sheets copilot",
    "data analysis",
    "generate charts",
    "translate sheet",
    "spreadsheet",
    "write formula",
    "format sheet",
    "word copilot",
    "excel copilot",
    "google docs copilot",
    "office copilot",
    "google sheets copilot",
    "excel chat",
    "powerpoint copilot",
    "generate slides",
    "generate powerpoint"
  ],
  icons: '/logo.svg',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AlertProvider>
          <AuthProvider>{children}</AuthProvider>
        </AlertProvider>
      </body>
    </html>
  );
}
