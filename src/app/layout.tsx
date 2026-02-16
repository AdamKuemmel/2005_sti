import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { TopNav } from "~/components/top-nav";
import { SessionProvider } from "next-auth/react";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { vehicle } from "~/server/db/schema";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "~/app/api/uploadthing/core";

export const metadata: Metadata = {
  title: "2005 STI Tracker",
  description: "Vehicle maintenance tracking",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

async function getAllVehicles() {
  // Public function - anyone can view all vehicles
  return await db.select().from(vehicle);
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  const vehicles = await getAllVehicles();

  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <SessionProvider>
          <TopNav />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
