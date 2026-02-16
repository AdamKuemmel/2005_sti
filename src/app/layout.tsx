import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { TopNav } from "~/components/top-nav";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "~/components/theme-provider";

import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "~/app/api/uploadthing/core";

export const metadata: Metadata = {
  title: "Interval - Vehicle Maintenance Tracking",
  description: "Vehicle maintenance tracking",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          themes={["light", "dark", "sti"]}
        >
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          <SessionProvider>
            <TopNav />
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
