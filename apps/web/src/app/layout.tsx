"use client";
import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useEffect } from "react";

const inter = Inter({
  subsets: ["latin"],
});

// export const metadata: Metadata = {
//   title: "Safe-IT Journal Helper",
//   description: "Safe-IT Journal Helper by AIR",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const keysPressed: string[] = [];

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.push(e.key.toLowerCase());

      if (
        keysPressed.includes("s") &&
        keysPressed.includes("h") &&
        keysPressed.includes("i") &&
        keysPressed.includes("t") &&
        document.activeElement?.id !== "canvas-panel"
      ) {
        e.preventDefault();
        // Dispatch a custom event to toggle chatCollapsed
        window.dispatchEvent(new CustomEvent('toggleChat'));
        // Clear the keysPressed array
        keysPressed.length = 0;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const index = keysPressed.indexOf(e.key.toLowerCase());
      if (index > -1) {
        keysPressed.splice(index, 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <html lang="en" className="h-screen">
      <body className={cn("min-h-full", "font-cal", "antialiased", inter.className)}>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
