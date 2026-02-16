"use client";

import Link from "next/link";
import { useState } from "react";
import { updateVehicle } from "~/server/actions/vehicles";

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
  const [editing, setEditing] = useState(false);

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h1>
          <p className="mt-2 text-xl text-muted-foreground">
            Current Mileage: {vehicle.currentMileage.toLocaleString()} miles
          </p>
        </div>

        {isLoggedIn && (
          <div className="flex gap-2">
            {editing ? (
              <form action={updateVehicle} className="flex items-center gap-2">
                <input type="hidden" name="vehicleId" value={vehicle.id} />
                <input type="hidden" name="year" value={vehicle.year} />
                <input type="hidden" name="make" value={vehicle.make} />
                <input type="hidden" name="model" value={vehicle.model} />
                <input type="hidden" name="redirectTo" value="/history" />
                <input
                  type="number"
                  name="currentMileage"
                  defaultValue={vehicle.currentMileage}
                  min={vehicle.currentMileage}
                  className="w-36 rounded border border-input px-3 py-2 text-sm"
                  autoFocus
                />
                <button
                  type="submit"
                  className="rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded border border-input px-4 py-2 text-sm hover:bg-muted/50"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
              >
                Update Mileage
              </button>
            )}
            <Link
              href={`/vehicle/settings?vehicleId=${vehicle.id}`}
              className="rounded border border-input px-4 py-2 text-sm hover:bg-muted/50"
            >
              Settings
            </Link>
            <Link
              href={`/vehicle/service/add?vehicleId=${vehicle.id}`}
              className="rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Add Service Record
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
