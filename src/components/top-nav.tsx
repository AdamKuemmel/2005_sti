"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { LoginModal } from "~/components/auth/login-modal";

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

export function TopNav({
  vehicles = [],
  currentVehicleId,
  isLoggedIn = false,
}: TopNavProps) {
  const { data: session } = useSession();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isVehicleMenuOpen, setIsVehicleMenuOpen] = useState(false);

  const currentVehicle = vehicles.find((v) => v.id === currentVehicleId);

  return (
    <>
      <nav className="flex w-full items-center justify-between bg-gray-800 p-4 text-white">
        <div className="flex items-center gap-6">
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link href="/vehicle" className="hover:underline">
                Vehicles
              </Link>
            </li>
          </ul>
        </div>

        <div>
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm">Hello, {session.user?.name}</span>
              <button
                onClick={() => signOut()}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
