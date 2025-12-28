"use client";

import { useState } from "react";
import { STI_MAINTENANCE_ITEMS } from "~/lib/maintenance-schedule-contants";
import { saveMaintenanceSchedule } from "~/server/actions/seed-maintenance";

interface Vehicle {
  id: number;
  year: number;
  make: string;
  model: string;
}

interface SetupMaintenanceFormProps {
  vehicle: Vehicle;
}

interface MaintenanceItem {
  title: string;
  category: string;
  description: string;
  intervalMiles: number | null;
  intervalMonths: number | null;
}

export function SetupMaintenanceForm({ vehicle }: SetupMaintenanceFormProps) {
  const [items, setItems] = useState<MaintenanceItem[]>(
    STI_MAINTENANCE_ITEMS.map((item) => ({ ...item })),
  );

  const updateItem = (
    index: number,
    field: keyof MaintenanceItem,
    value: number | null,
  ) => {
    const newItems = [...items];
    const item = newItems[index];
    if (item) {
      newItems[index] = { ...item, [field]: value };
      setItems(newItems);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("vehicleId", vehicle.id.toString());
    formData.append("items", JSON.stringify(items));

    await saveMaintenanceSchedule(formData);
  };

  const categoryColors: Record<string, string> = {
    fluid: "bg-blue-100 text-blue-800",
    engine_drivetrain: "bg-red-100 text-red-800",
    consumable: "bg-green-100 text-green-800",
    inspection: "bg-yellow-100 text-yellow-800",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
        <h3 className="mb-2 font-semibold">Quick Presets</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              const conservative = items.map((item) => ({
                ...item,
                intervalMiles: item.intervalMiles
                  ? Math.floor(item.intervalMiles * 0.75)
                  : null,
              }));
              setItems(conservative);
            }}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Make 25% More Conservative
          </button>
          <button
            type="button"
            onClick={() =>
              setItems(STI_MAINTENANCE_ITEMS.map((item) => ({ ...item })))
            }
            className="rounded bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-700"
          >
            Reset to Factory
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm"
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      categoryColors[item.category] ??
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.category.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{item.description}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Interval (Miles)
                </label>
                <input
                  type="number"
                  value={item.intervalMiles ?? ""}
                  onChange={(e) =>
                    updateItem(
                      index,
                      "intervalMiles",
                      e.target.value ? parseInt(e.target.value) : null,
                    )
                  }
                  min="0"
                  step="100"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                  placeholder="N/A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Interval (Months)
                </label>
                <input
                  type="number"
                  value={item.intervalMonths ?? ""}
                  onChange={(e) =>
                    updateItem(
                      index,
                      "intervalMonths",
                      e.target.value ? parseInt(e.target.value) : null,
                    )
                  }
                  min="0"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                  placeholder="N/A"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 border-t border-gray-300 pt-6">
        <button
          type="submit"
          className="rounded bg-green-600 px-6 py-3 text-white hover:bg-green-700"
        >
          Create Maintenance Schedule
        </button>
        <a
          href="/history"
          className="rounded bg-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-400"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
