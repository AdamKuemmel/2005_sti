"use client";

import { deleteVehicle } from "~/server/actions/vehicles";

interface DeleteVehicleButtonProps {
  vehicleId: number;
  vehicleName: string;
}

export function DeleteVehicleButton({ vehicleId, vehicleName }: DeleteVehicleButtonProps) {
  return (
    <form
      action={deleteVehicle}
      onSubmit={(e) => {
        if (!confirm(`Delete ${vehicleName} and all its service records and maintenance history? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <button
        type="submit"
        className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    </form>
  );
}
