"use client";

import { useState } from "react";
import { STI_MAINTENANCE_ITEMS } from "~/lib/maintenance-schedule-contants";
import {
  saveMaintenanceSchedule,
  updateMaintenanceSchedule,
} from "~/server/actions/maintenance";

interface Vehicle {
  id: number;
  year: number;
  make: string;
  model: string;
}

interface MaintenanceScheduleItem {
  id: number;
  vehicleId: number;
  title: string;
  category: string;
  description: string | null;
  intervalMiles: number | null;
  intervalMonths: number | null;
  lastServicedDate: string | null;
  lastServicedMileage: number | null;
  lastServiceRecordId: number | null;
  nextDueDate: string | null;
  nextDueMileage: number | null;
  isActive: boolean;
}

interface EditMaintenanceFormProps {
  vehicle: Vehicle;
  existingSchedule: MaintenanceScheduleItem[];
}

interface MaintenanceItem {
  id?: number;
  title: string;
  category: string;
  description: string;
  intervalMiles: number | null;
  intervalMonths: number | null;
}

export function EditMaintenanceForm({
  vehicle,
  existingSchedule,
}: EditMaintenanceFormProps) {
  // If existing schedule exists, use it; otherwise use template
  const initialItems: MaintenanceItem[] =
    existingSchedule.length > 0
      ? existingSchedule.map((item) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          description: item.description ?? "",
          intervalMiles: item.intervalMiles,
          intervalMonths: item.intervalMonths,
        }))
      : STI_MAINTENANCE_ITEMS.map((item) => ({ ...item }));

  const [items, setItems] = useState<MaintenanceItem[]>(initialItems);
  const isEditing = existingSchedule.length > 0;

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

    if (isEditing) {
      await updateMaintenanceSchedule(formData);
    } else {
      await saveMaintenanceSchedule(formData);
    }
  };

  const categoryColors: Record<string, string> = {
    fluid: "bg-primary/10 text-primary",
    engine_drivetrain: "bg-destructive/10 text-destructive",
    consumable: "bg-secondary text-secondary-foreground",
    inspection: "bg-accent/50 text-accent-foreground",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-input bg-muted/50 p-4">
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
            className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Make 25% More Conservative
          </button>
          <button
            type="button"
            onClick={() =>
              setItems(STI_MAINTENANCE_ITEMS.map((item) => ({ ...item })))
            }
            className="rounded bg-secondary px-4 py-2 text-sm text-secondary-foreground hover:bg-secondary/80"
          >
            Reset to Factory
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-input bg-card p-4 shadow-sm"
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      categoryColors[item.category] ??
                      "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.category.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground">
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
                  className="mt-1 block w-full rounded-md border border-input px-3 py-2 shadow-sm focus:border-ring focus:ring-ring focus:ring-1 focus:outline-none"
                  placeholder="N/A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
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
                  className="mt-1 block w-full rounded-md border border-input px-3 py-2 shadow-sm focus:border-ring focus:ring-ring focus:ring-1 focus:outline-none"
                  placeholder="N/A"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 border-t border-input pt-6">
        <button
          type="submit"
          className="rounded bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
        >
          {isEditing ? "Update" : "Create"} Maintenance Schedule
        </button>
        <a
          href="/history"
          className="rounded bg-secondary px-6 py-3 text-foreground hover:bg-secondary/80"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
