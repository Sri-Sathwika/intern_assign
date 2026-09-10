import type { Metadata } from "next";
import "./globals.css";
import AuthSessionProvider from "@/components/SessionProvider";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "NOVA",
  description: "Team Productivity Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>
          <Navbar />
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}