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
              <Link href="/history" className="hover:underline">
                History
              </Link>
            </li>
          </ul>

          {/* Vehicle Selector - Visible to everyone if there are vehicles */}
          {vehicles.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setIsVehicleMenuOpen(!isVehicleMenuOpen)}
                className="flex items-center gap-2 rounded bg-gray-700 px-3 py-2 hover:bg-gray-600"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                <span>
                  {currentVehicle
                    ? `${currentVehicle.year} ${currentVehicle.make} ${currentVehicle.model}`
                    : vehicles.length === 1
                      ? `${vehicles[0]!.year} ${vehicles[0]!.make} ${vehicles[0]!.model}`
                      : "Select Vehicle"}
                </span>
              </button>

              {isVehicleMenuOpen && (
                <>
                  {/* Backdrop to close menu when clicking outside */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsVehicleMenuOpen(false)}
                  />
                  <div className="absolute left-0 z-20 mt-2 w-64 rounded-md bg-white shadow-lg">
                    <div className="py-1">
                      {vehicles.map((vehicle) => (
                        <div key={vehicle.id}>
                          <Link
                            href={`/history?vehicleId=${vehicle.id}`}
                            onClick={() => setIsVehicleMenuOpen(false)}
                            className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                              vehicle.id === currentVehicleId
                                ? "bg-gray-100 font-semibold"
                                : ""
                            }`}
                          >
                            {vehicle.year} {vehicle.make} {vehicle.model}
                            <div className="text-xs text-gray-500">
                              {vehicle.currentMileage.toLocaleString()} miles
                            </div>
                          </Link>
                          {session && (
                            <Link
                              href={`/maintenance/edit?vehicleId=${vehicle.id}`}
                              onClick={() => setIsVehicleMenuOpen(false)}
                              className="block px-4 py-1.5 text-xs text-blue-600 hover:bg-gray-50"
                            >
                              ⚙️ Edit Maintenance Schedule
                            </Link>
                          )}
                        </div>
                      ))}

                      {/* Only show Add Vehicle option when logged in */}
                      {session && (
                        <div className="border-t border-gray-200">
                          <Link
                            href="/vehicle/add"
                            onClick={() => setIsVehicleMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                          >
                            + Add New Vehicle
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
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
