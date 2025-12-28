"use client";

import { useState } from "react";
import { addServiceRecord } from "~/server/actions/add-service-record";

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
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700"
        >
          Category *
        </label>
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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
        >
          <option value="fluid">Fluids</option>
          <option value="engine_drivetrain">Engine/Drivetrain</option>
          <option value="consumable">Consumables</option>
          <option value="inspection">Inspection</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Service Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Service *
        </label>
        {!customTitle ? (
          <div className="flex gap-2">
            <select
              id="title"
              name="title"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select a service...</option>
              {titleOptions.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setCustomTitle(true)}
              className="mt-1 rounded bg-gray-200 px-4 py-2 text-sm whitespace-nowrap hover:bg-gray-300"
            >
              Custom
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="Enter custom service name"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setCustomTitle(false)}
              className="mt-1 rounded bg-gray-200 px-4 py-2 text-sm whitespace-nowrap hover:bg-gray-300"
            >
              Dropdown
            </button>
          </div>
        )}
      </div>

      {/* Date */}
      <div>
        <label
          htmlFor="serviceDate"
          className="block text-sm font-medium text-gray-700"
        >
          Service Date *
        </label>
        <input
          type="date"
          id="serviceDate"
          name="serviceDate"
          required
          max={new Date().toISOString().split("T")[0]}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Mileage */}
      <div>
        <label
          htmlFor="mileage"
          className="block text-sm font-medium text-gray-700"
        >
          Mileage *
        </label>
        <input
          type="number"
          id="mileage"
          name="mileage"
          required
          min="0"
          defaultValue={vehicle.currentMileage}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
        />
        <p className="mt-1 text-sm text-gray-500">
          Current vehicle mileage: {vehicle.currentMileage.toLocaleString()}
        </p>
      </div>

      {/* Location */}
      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-gray-700"
        >
          Location
        </label>
        <select
          id="location"
          name="location"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">Select location...</option>
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Parts Brand */}
      <div>
        <label
          htmlFor="partsBrand"
          className="block text-sm font-medium text-gray-700"
        >
          Parts Brand
        </label>
        {!customBrand ? (
          <div className="flex gap-2">
            <select
              id="partsBrand"
              name="partsBrand"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select brand...</option>
              {brandOptions.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setCustomBrand(true)}
              className="mt-1 rounded bg-gray-200 px-4 py-2 text-sm whitespace-nowrap hover:bg-gray-300"
            >
              Custom
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              id="partsBrand"
              name="partsBrand"
              placeholder="Enter custom brand"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setCustomBrand(false)}
              className="mt-1 rounded bg-gray-200 px-4 py-2 text-sm whitespace-nowrap hover:bg-gray-300"
            >
              Dropdown
            </button>
          </div>
        )}
      </div>

      {/* Part Number */}
      <div>
        <label
          htmlFor="partNumber"
          className="block text-sm font-medium text-gray-700"
        >
          Part Number
        </label>
        <input
          type="text"
          id="partNumber"
          name="partNumber"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          placeholder="e.g., 15208AA15A"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          placeholder="Brief description of the service performed..."
        />
      </div>

      {/* Costs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="partsCost"
            className="block text-sm font-medium text-gray-700"
          >
            Parts Cost ($)
          </label>
          <input
            type="number"
            id="partsCost"
            name="partsCost"
            step="0.01"
            min="0"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            placeholder="0.00"
          />
        </div>
        <div>
          <label
            htmlFor="laborCost"
            className="block text-sm font-medium text-gray-700"
          >
            Labor Cost ($)
          </label>
          <input
            type="number"
            id="laborCost"
            name="laborCost"
            step="0.01"
            min="0"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700"
        >
          Additional Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          placeholder="Any additional observations, issues found, recommendations, etc..."
        />
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          className="rounded bg-green-600 px-6 py-2 text-white hover:bg-green-700"
        >
          Add Service Record
        </button>
        <a
          href="/history"
          className="rounded bg-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-400"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
