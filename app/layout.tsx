import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "SSP-AD-ACTION-SIMULATOR",
  icons: {
    icon: "/favicon.svg",        // normal favicon (32 × 32 or 48 × 48)
    shortcut: "/favicon.svg",    // for “Add to bookmarks”
    apple: "/favicon.svg",       // iOS / iPad homescreen
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
