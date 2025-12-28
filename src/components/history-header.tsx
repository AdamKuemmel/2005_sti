"use client";

import Link from "next/link";

interface Vehicle {
  id: number;
  year: number;
  make: string;
  model: string;
  currentMileage: number;
  lastMileageUpdate: Date;
}

interface HistoryHeaderProps {
  vehicle: Vehicle;
  isLoggedIn: boolean;
}

export function HistoryHeader({ vehicle, isLoggedIn }: HistoryHeaderProps) {
  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h1>
          <p className="mt-2 text-xl text-gray-600">
            Current Mileage: {vehicle.currentMileage.toLocaleString()} miles
          </p>
        </div>

        {isLoggedIn && (
          <div className="flex gap-2">
            <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Update Mileage
            </button>
            <Link
              href="/service/add"
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Add Service Record
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
