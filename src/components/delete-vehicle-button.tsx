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
        className="rounded border border-destructive/30 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
      >
        Delete
      </button>
    </form>
  );
}
