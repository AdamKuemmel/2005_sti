"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, Gauge, Home, Car, LogOut } from "lucide-react";
import { LoginModal } from "~/components/auth/login-modal";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Separator } from "~/components/ui/separator";
import { WrenchIcon } from "lucide-react";

interface Vehicle {
  id: number;
  year: number;
  make: string;
  model: string;
  currentMileage: number;
}

interface TopNavProps {
  vehicles?: Vehicle[];
  currentVehicleId?: number;
  isLoggedIn?: boolean;
}

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/vehicle", label: "Vehicles", icon: Car },
];

function getInitials(name?: string | null) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function TopNav(_props: TopNavProps) {
  const { data: session } = useSession();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = getInitials(session?.user?.name);

  return (
    <>
      <header className="bg-background/80 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold tracking-tight transition-opacity hover:opacity-75"
          >
            <Gauge className="text-primary size-5" />
            <span className="text-base"></span>
          </Link>

          {/* Desktop nav links */}
          {/* <nav className="flex items-center gap-1 max-md:hidden">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav> */}

          {/* Desktop auth */}
          <div className="items-center gap-3 max-md:hidden">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-9 w-9 rounded-full p-0"
                    aria-label="User menu"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={session.user?.image || undefined}
                        alt="User avatar"
                      />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm leading-none font-medium">
                      {session.user?.name}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {session.user?.email}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      window.location.href = "/vehicle";
                    }}
                  >
                    <WrenchIcon className="size-4" />
                    Garage
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    className="cursor-pointer"
                    onClick={() => signOut()}
                  >
                    <LogOut className="size-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" onClick={() => setIsLoginModalOpen(true)}>
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-72 flex-col">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Gauge className="text-primary size-5" />
                  2005 STI
                </SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col gap-1 px-2">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
                  >
                    <Icon className="size-4" />
                    {label}
                  </Link>
                ))}
              </nav>

              <Separator />

              <div className="px-2">
                {session ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 px-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={session.user?.image || undefined}
                          alt="User avatar"
                        />
                        <AvatarFallback className="text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {session.user?.name}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {session.user?.email}
                        </p>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" className="w-full">
                      <WrenchIcon className="size-4" /> Garage
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setMobileOpen(false);
                        void signOut();
                      }}
                    >
                      <LogOut className="size-4" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => {
                      setMobileOpen(false);
                      setIsLoginModalOpen(true);
                    }}
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
