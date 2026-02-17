"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface VehicleOption {
  id: number;
  year: number;
  make: string;
  model: string;
}

interface VehiclePickerDropdownProps {
  vehicles: VehicleOption[];
  label: string;
  icon: LucideIcon;
  hrefFn: (vehicleId: number) => string;
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export function VehiclePickerDropdown({
  vehicles,
  label,
  icon: Icon,
  hrefFn,
  variant = "outline",
}: VehiclePickerDropdownProps) {
  if (vehicles.length === 0) {
    return (
      <Button variant={variant} disabled className="pointer-events-none opacity-50">
        <Icon />
        {label}
      </Button>
    );
  }

  if (vehicles.length === 1) {
    const v = vehicles[0]!;
    return (
      <Button asChild variant={variant}>
        <Link href={hrefFn(v.id)}>
          <Icon />
          {label}
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant}>
          <Icon />
          {label}
          <ChevronDown className="ml-1 size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {vehicles.map((v) => (
          <DropdownMenuItem key={v.id} asChild>
            <Link href={hrefFn(v.id)}>
              {v.year} {v.make} {v.model}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
