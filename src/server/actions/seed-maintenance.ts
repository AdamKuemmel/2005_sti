"use server";

import { db } from "~/server/db";
import { maintenanceSchedule, vehicle } from "~/server/db/schema";
import { auth } from "~/server/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { STI_MAINTENANCE_ITEMS } from "~/lib/maintenance-schedule-contants";

export async function seedMaintenanceSchedule(vehicleId: number) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Get current vehicle
  const [currentVehicle] = await db
    .select()
    .from(vehicle)
    .where(eq(vehicle.id, vehicleId));

  if (!currentVehicle) {
    throw new Error("Vehicle not found");
  }

  const currentDate = new Date();
  const currentMileage = currentVehicle.currentMileage;

  // For a used car with NO service history, assume ALL services are DUE NOW
  // As user adds service records, those items will be cleared from upcoming maintenance
  const items = STI_MAINTENANCE_ITEMS.map((item) => {
    let nextDueMileage = null;
    let nextDueDate = null;

    // Set mileage-based services as due at current mileage (i.e., due NOW)
    if (item.intervalMiles) {
      nextDueMileage = currentMileage;
    }

    // Set date-based services as due today (i.e., due NOW)
    if (item.intervalMonths) {
      nextDueDate = currentDate.toISOString().split("T")[0];
    }

    return {
      ...item,
      vehicleId,
      nextDueMileage,
      nextDueDate,
      isActive: true,
      createdById: session.user.id,
    };
  });

  await db.insert(maintenanceSchedule).values(items);

  return { success: true, count: items.length };
}

// Type for maintenance items coming from the form
interface MaintenanceItemInput {
  id?: number;
  title: string;
  category: string;
  description: string;
  intervalMiles: number | null;
  intervalMonths: number | null;
}

export async function saveMaintenanceSchedule(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const vehicleId = parseInt(formData.get("vehicleId") as string);
  const itemsJson = formData.get("items") as string;
  const items = JSON.parse(itemsJson) as MaintenanceItemInput[];

  // Get current vehicle to calculate initial due dates
  const [currentVehicle] = await db
    .select()
    .from(vehicle)
    .where(eq(vehicle.id, vehicleId));

  if (!currentVehicle) {
    throw new Error("Vehicle not found");
  }

  const currentDate = new Date();
  const currentMileage = currentVehicle.currentMileage;

  // Insert all customized maintenance items with calculated due dates
  const scheduleItems = items.map((item) => {
    let nextDueMileage: number | null = null;
    let nextDueDate: string | null = null;

    // Calculate next due mileage
    if (item.intervalMiles) {
      nextDueMileage = currentMileage + item.intervalMiles;
    }

    // Calculate next due date
    if (item.intervalMonths) {
      const dueDate = new Date(currentDate);
      dueDate.setMonth(dueDate.getMonth() + item.intervalMonths);
      nextDueDate = dueDate.toISOString().split("T")[0] ?? null; // Format as YYYY-MM-DD
    }

    return {
      vehicleId,
      title: item.title,
      category: item.category,
      description: item.description,
      intervalMiles: item.intervalMiles,
      intervalMonths: item.intervalMonths,
      nextDueMileage,
      nextDueDate,
      isActive: true,
      createdById: session.user.id,
    };
  });

  await db.insert(maintenanceSchedule).values(scheduleItems);

  revalidatePath("/history");
  redirect("/history");
}

export async function updateMaintenanceSchedule(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const itemsJson = formData.get("items") as string;
  const items = JSON.parse(itemsJson) as MaintenanceItemInput[];

  // Update each maintenance item
  for (const item of items) {
    if (item.id) {
      await db
        .update(maintenanceSchedule)
        .set({
          intervalMiles: item.intervalMiles,
          intervalMonths: item.intervalMonths,
          description: item.description,
        })
        .where(eq(maintenanceSchedule.id, item.id));
    }
  }

  revalidatePath("/history");
  redirect("/history");
}

// For future: function to generate schedule for any make/model using Claude API
export async function generateMaintenanceSchedule(
  year: number,
  make: string,
  model: string,
  vehicleId: number,
) {
  // TODO: Use Claude API to research and generate maintenance schedule
  // For now, just use the STI schedule as template
  return seedMaintenanceSchedule(vehicleId);
}
