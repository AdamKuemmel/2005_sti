"use client";

import Link from "next/link";
import { Car, ClipboardList, Wrench } from "lucide-react";
import { Button } from "~/components/ui/button";
import { VehiclePickerDropdown } from "./VehiclePickerDropdown";

interface VehicleOption {
  id: number;
  year: number;
  make: string;
  model: string;
}

interface QuickActionsBarProps {
  vehicles: VehicleOption[];
}

export function QuickActionsBar({ vehicles }: QuickActionsBarProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <Button asChild>
        <Link href="/vehicle/add">
          <Car />
          Add Vehicle
        </Link>
      </Button>

      <VehiclePickerDropdown
        vehicles={vehicles}
        label="Log Service"
        icon={Wrench}
        hrefFn={() => "/vehicle/service/add"}
      />

      <VehiclePickerDropdown
        vehicles={vehicles}
        label="View Maintenance"
        icon={ClipboardList}
        hrefFn={(id) => `/vehicle/maintenance?vehicleId=${id}`}
      />
    </div>
  );
}
