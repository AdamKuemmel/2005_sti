"use server";

import { db } from "~/server/db";
import {
  serviceRecords,
  vehicle,
  maintenanceSchedule,
} from "~/server/db/schema";
import { eq, desc, and, or, lte, gte } from "drizzle-orm";

// Get a specific vehicle by ID, or get the first vehicle if no ID provided
export async function getVehicle(vehicleId?: number) {
  if (vehicleId) {
    const vehicles = await db
      .select()
      .from(vehicle)
      .where(eq(vehicle.id, vehicleId))
      .limit(1);
    return vehicles[0] ?? null;
  }

  // If no vehicleId provided, get the first vehicle
  const vehicles = await db.select().from(vehicle).limit(1);
  return vehicles[0] ?? null;
}

// Get all vehicles for a user
export async function getAllVehicles(userId: string) {
  return await db.select().from(vehicle).where(eq(vehicle.ownerId, userId));
}

// Get upcoming maintenance for a vehicle
export async function getUpcomingMaintenance(vehicleId: number) {
  const currentVehicle = await getVehicle(vehicleId);
  if (!currentVehicle) return [];

  const currentMileage = currentVehicle.currentMileage;

  // Get all active maintenance items
  const items = await db
    .select()
    .from(maintenanceSchedule)
    .where(
      and(
        eq(maintenanceSchedule.vehicleId, vehicleId),
        eq(maintenanceSchedule.isActive, true),
      ),
    );

  // Calculate which items are due or coming up soon
  const upcoming = items
    .map((item) => {
      let dueStatus: "overdue" | "due-soon" | "upcoming" | "ok" = "ok";
      let daysUntilDue: number | null = null;
      let milesUntilDue: number | null = null;

      // Check mileage-based due date
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

      // Check date-based due date
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
    // Sort by urgency: overdue > due-soon > upcoming
    .filter((item) => item.dueStatus !== "ok") // Only show items that need attention
    .sort((a, b) => {
      const statusOrder = { overdue: 0, "due-soon": 1, upcoming: 2, ok: 3 };
      if (statusOrder[a.dueStatus] !== statusOrder[b.dueStatus]) {
        return statusOrder[a.dueStatus] - statusOrder[b.dueStatus];
      }
      // Within same status, sort by soonest due
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

// Get service records, optionally filtered by vehicle and/or category
export async function getServiceRecords(vehicleId?: number, category?: string) {
  let baseQuery = db.select().from(serviceRecords);

  // Build conditions array
  const conditions = [];

  if (vehicleId) {
    conditions.push(eq(serviceRecords.vehicleId, vehicleId));
  }

  if (category && category !== "all") {
    conditions.push(eq(serviceRecords.category, category));
  }

  // Apply filters if any exist
  if (conditions.length > 0) {
    // For a single condition
    if (conditions.length === 1) {
      return await db
        .select()
        .from(serviceRecords)
        .where(conditions[0])
        .orderBy(desc(serviceRecords.serviceDate));
    }
    // For multiple conditions, we'd need to use `and()` - but for now we handle them separately
    // Since we're checking vehicleId first, then category
    let query = db.select().from(serviceRecords);

    if (vehicleId) {
      query = query.where(eq(serviceRecords.vehicleId, vehicleId)) as any;
    }

    if (category && category !== "all") {
      query = query.where(eq(serviceRecords.category, category)) as any;
    }

    return await (query as any).orderBy(desc(serviceRecords.serviceDate));
  }

  // No filters - return all records
  return await db
    .select()
    .from(serviceRecords)
    .orderBy(desc(serviceRecords.serviceDate));
}

export async function searchServiceRecords(searchTerm: string) {
  // We'll implement this after we get the basic page working
  return [];
}
