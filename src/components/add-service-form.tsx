"use client";

import { useState } from "react";
import { addServiceRecord } from "~/server/actions/service-records";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

interface Vehicle {
  id: number;
  year: number;
  make: string;
  model: string;
  currentMileage: number;
}

interface AddServiceFormProps {
  vehicle: Vehicle;
}

// Service title options organized by category
const SERVICE_TITLES = {
  fluid: [
    "Engine Oil Change",
    "Transmission Fluid Change",
    "Front Differential Fluid Change",
    "Rear Differential Fluid Change",
    "Coolant Flush",
    "Brake Fluid Flush",
    "Power Steering Fluid Change",
    "Clutch Fluid Change",
  ],
  engine_drivetrain: [
    "Spark Plugs",
    "Timing Belt",
    "Serpentine Belt",
    "Water Pump",
    "Thermostat",
    "Clutch Replacement",
    "Alternator",
    "Starter",
    "Fuel Pump",
    "Fuel Filter",
    "Turbo Inspection/Service",
    "Valve Cover Gaskets",
    "Head Gaskets",
  ],
  consumable: [
    "Air Filter",
    "Cabin Air Filter",
    "Brake Pads - Front",
    "Brake Pads - Rear",
    "Brake Rotors - Front",
    "Brake Rotors - Rear",
    "Tires - All Four",
    "Tire Rotation",
    "Wheel Alignment",
    "Windshield Wipers",
    "Battery",
  ],
  inspection: [
    "Annual Safety Inspection",
    "Pre-Purchase Inspection",
    "Emissions Test",
    "General Inspection",
    "Diagnostic Scan",
  ],
  other: ["Detailing", "Undercoating", "Rust Prevention", "Custom"],
};

// Common parts brands
const PARTS_BRANDS = {
  fluid: [
    "Subaru OEM",
    "Motul",
    "Mobil 1",
    "Castrol",
    "Valvoline",
    "Pennzoil",
    "Royal Purple",
    "Amsoil",
  ],
  engine_drivetrain: [
    "Subaru OEM",
    "NGK",
    "Denso",
    "Gates",
    "ACDelco",
    "Bosch",
    "Aisin",
    "Exedy",
  ],
  consumable: [
    "Subaru OEM",
    "Michelin",
    "Bridgestone",
    "Continental",
    "Brembo",
    "StopTech",
    "EBC",
    "Hawk",
    "K&N",
    "Mann Filter",
    "Bosch",
  ],
  other: ["N/A"],
};

// Service locations
const LOCATIONS = [
  "DIY - Home Garage",
  "Subaru Dealership",
  "Independent Mechanic",
  "Specialty Shop",
  "Quick Lube",
  "Tire Shop",
];

const selectClassName =
  "border-input dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

export function AddServiceForm({ vehicle }: AddServiceFormProps) {
  const [category, setCategory] = useState<string>("fluid");
  const [customTitle, setCustomTitle] = useState(false);
  const [customBrand, setCustomBrand] = useState(false);

  const titleOptions =
    SERVICE_TITLES[category as keyof typeof SERVICE_TITLES] || [];
  const brandOptions = PARTS_BRANDS[category as keyof typeof PARTS_BRANDS] || [
    "N/A",
  ];

  return (
    <form action={addServiceRecord} className="space-y-6">
      <input type="hidden" name="vehicleId" value={vehicle.id} />

      {/* Category Selection */}
      <div className="space-y-1.5">
        <Label htmlFor="category">Category *</Label>
        <select
          id="category"
          name="category"
          required
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setCustomTitle(false);
            setCustomBrand(false);
          }}
          className={selectClassName}
        >
          <option value="fluid">Fluids</option>
          <option value="engine_drivetrain">Engine/Drivetrain</option>
          <option value="consumable">Consumables</option>
          <option value="inspection">Inspection</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Service Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Service *</Label>
        {!customTitle ? (
          <div className="flex gap-2">
            <select
              id="title"
              name="title"
              required
              className={selectClassName}
            >
              <option value="">Select a service...</option>
              {titleOptions.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCustomTitle(true)}
            >
              Custom
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              type="text"
              id="title"
              name="title"
              required
              placeholder="Enter custom service name"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCustomTitle(false)}
            >
              Dropdown
            </Button>
          </div>
        )}
      </div>

      {/* Date */}
      <div className="space-y-1.5">
        <Label htmlFor="serviceDate">Service Date *</Label>
        <Input
          type="date"
          id="serviceDate"
          name="serviceDate"
          required
          max={new Date().toISOString().split("T")[0]}
        />
      </div>

      {/* Mileage */}
      <div className="space-y-1.5">
        <Label htmlFor="mileage">Mileage *</Label>
        <Input
          type="number"
          id="mileage"
          name="mileage"
          required
          min="0"
          defaultValue={vehicle.currentMileage}
        />
        <p className="text-sm text-muted-foreground">
          Current vehicle mileage: {vehicle.currentMileage.toLocaleString()}
        </p>
      </div>

      {/* Location */}
      <div className="space-y-1.5">
        <Label htmlFor="location">Location</Label>
        <select id="location" name="location" className={selectClassName}>
          <option value="">Select location...</option>
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Parts Brand */}
      <div className="space-y-1.5">
        <Label htmlFor="partsBrand">Parts Brand</Label>
        {!customBrand ? (
          <div className="flex gap-2">
            <select id="partsBrand" name="partsBrand" className={selectClassName}>
              <option value="">Select brand...</option>
              {brandOptions.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCustomBrand(true)}
            >
              Custom
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              type="text"
              id="partsBrand"
              name="partsBrand"
              placeholder="Enter custom brand"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCustomBrand(false)}
            >
              Dropdown
            </Button>
          </div>
        )}
      </div>

      {/* Part Number */}
      <div className="space-y-1.5">
        <Label htmlFor="partNumber">Part Number</Label>
        <Input
          type="text"
          id="partNumber"
          name="partNumber"
          placeholder="e.g., 15208AA15A"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Brief description of the service performed..."
        />
      </div>

      {/* Costs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="partsCost">Parts Cost ($)</Label>
          <Input
            type="number"
            id="partsCost"
            name="partsCost"
            step="0.01"
            min="0"
            placeholder="0.00"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="laborCost">Labor Cost ($)</Label>
          <Input
            type="number"
            id="laborCost"
            name="laborCost"
            step="0.01"
            min="0"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder="Any additional observations, issues found, recommendations, etc..."
        />
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <Button type="submit">Add Service Record</Button>
        <Button variant="secondary" asChild>
          <a href="/history">Cancel</a>
        </Button>
      </div>
    </form>
  );
}
