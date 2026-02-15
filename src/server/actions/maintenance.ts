"use server";

import { db } from "~/server/db";
import { maintenanceSchedule, vehicle } from "~/server/db/schema";
import { auth } from "~/server/auth";
import { eq, and, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { STI_MAINTENANCE_ITEMS } from "~/lib/maintenance-schedule-contants";

export async function seedMaintenanceSchedule(vehicleId: number) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const [currentVehicle] = await db
    .select()
    .from(vehicle)
    .where(eq(vehicle.id, vehicleId));

  if (!currentVehicle) {
    throw new Error("Vehicle not found");
  }

  if (currentVehicle.ownerId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const currentDate = new Date();
  const currentMileage = currentVehicle.currentMileage;

  const items = STI_MAINTENANCE_ITEMS.map((item) => {
    let nextDueMileage = null;
    let nextDueDate = null;

    if (item.intervalMiles) {
      nextDueMileage = currentMileage;
    }

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

  const [currentVehicle] = await db
    .select()
    .from(vehicle)
    .where(eq(vehicle.id, vehicleId));

  if (!currentVehicle) {
    throw new Error("Vehicle not found");
  }

  if (currentVehicle.ownerId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const currentDate = new Date();
  const currentMileage = currentVehicle.currentMileage;

  const scheduleItems = items.map((item) => {
    let nextDueMileage: number | null = null;
    let nextDueDate: string | null = null;

    if (item.intervalMiles) {
      nextDueMileage = currentMileage + item.intervalMiles;
    }

    if (item.intervalMonths) {
      const dueDate = new Date(currentDate);
      dueDate.setMonth(dueDate.getMonth() + item.intervalMonths);
      nextDueDate = dueDate.toISOString().split("T")[0] ?? null;
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

  // Subquery: vehicle IDs owned by this user
  const ownedVehicleIds = db
    .select({ id: vehicle.id })
    .from(vehicle)
    .where(eq(vehicle.ownerId, session.user.id));

  for (const item of items) {
    if (item.id) {
      await db
        .update(maintenanceSchedule)
        .set({
          intervalMiles: item.intervalMiles,
          intervalMonths: item.intervalMonths,
          description: item.description,
        })
        .where(
          and(
            eq(maintenanceSchedule.id, item.id),
            inArray(maintenanceSchedule.vehicleId, ownedVehicleIds),
          ),
        );
    }
  }

  revalidatePath("/history");
  redirect("/history");
}

export async function getUpcomingMaintenance(vehicleId: number) {
  const [currentVehicle] = await db
    .select()
    .from(vehicle)
    .where(eq(vehicle.id, vehicleId));

  if (!currentVehicle) return [];

  const currentMileage = currentVehicle.currentMileage;

  const items = await db
    .select()
    .from(maintenanceSchedule)
    .where(
      and(
        eq(maintenanceSchedule.vehicleId, vehicleId),
        eq(maintenanceSchedule.isActive, true),
      ),
    );

  const upcoming = items
    .map((item) => {
      let dueStatus: "overdue" | "due-soon" | "upcoming" | "ok" = "ok";
      let daysUntilDue: number | null = null;
      let milesUntilDue: number | null = null;

      if (item.nextDueMileage !== null) {
        milesUntilDue = item.nextDueMileage - currentMileage;

        if (milesUntilDue <= 0) {
          dueStatus = "overdue";
        } else if (milesUntilDue <= 1000) {
          dueStatus = "due-soon";
        } else if (milesUntilDue <= 5000) {
          dueStatus = "upcoming";
        }
      }

      if (item.nextDueDate) {
        const dueDate = new Date(item.nextDueDate);
        const today = new Date();
        const diffTime = dueDate.getTime() - today.getTime();
        daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysUntilDue <= 0) {
          dueStatus = "overdue";
        } else if (daysUntilDue <= 30) {
          if (dueStatus !== "overdue") dueStatus = "due-soon";
        } else if (daysUntilDue <= 90) {
          if (dueStatus !== "overdue" && dueStatus !== "due-soon")
            dueStatus = "upcoming";
        }
      }

      return {
        ...item,
        dueStatus,
        daysUntilDue,
        milesUntilDue,
      };
    })
    .filter((item) => item.dueStatus !== "ok")
    .sort((a, b) => {
      const statusOrder = { overdue: 0, "due-soon": 1, upcoming: 2, ok: 3 };
      if (statusOrder[a.dueStatus] !== statusOrder[b.dueStatus]) {
        return statusOrder[a.dueStatus] - statusOrder[b.dueStatus];
      }
      if (a.milesUntilDue !== null && b.milesUntilDue !== null) {
        return a.milesUntilDue - b.milesUntilDue;
      }
      if (a.daysUntilDue !== null && b.daysUntilDue !== null) {
        return a.daysUntilDue - b.daysUntilDue;
      }
      return 0;
    });

  return upcoming;
}

// For future: generate a maintenance schedule for any make/model using Claude API
export async function generateMaintenanceSchedule(
  year: number,
  make: string,
  model: string,
  vehicleId: number,
) {
  // TODO: Use Claude API to research and generate maintenance schedule
  return seedMaintenanceSchedule(vehicleId);
}
