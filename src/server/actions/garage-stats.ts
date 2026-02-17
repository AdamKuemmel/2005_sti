"use server";

import { db } from "~/server/db";
import { vehicle, serviceRecords } from "~/server/db/schema";
import { sql, eq, inArray } from "drizzle-orm";
import { getUpcomingMaintenance } from "~/server/actions/maintenance";

export async function getGarageStats(userId: string) {
  const ownedVehicles = await db
    .select({ id: vehicle.id })
    .from(vehicle)
    .where(eq(vehicle.ownerId, userId));

  const vehicleIds = ownedVehicles.map((v) => v.id);
  const vehicleCount = vehicleIds.length;

  if (vehicleIds.length === 0) {
    return { vehicleCount: 0, totalSpend: 0, openMaintenanceCount: 0, totalServiceRecords: 0 };
  }

  const [spendResult, recordCountResult, ...allAlerts] = await Promise.all([
    db
      .select({ total: sql<string>`COALESCE(SUM(${serviceRecords.totalCost}), '0')` })
      .from(serviceRecords)
      .where(inArray(serviceRecords.vehicleId, vehicleIds)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(serviceRecords)
      .where(inArray(serviceRecords.vehicleId, vehicleIds)),
    ...vehicleIds.map((id) => getUpcomingMaintenance(id)),
  ]);

  const totalSpend = parseFloat(spendResult[0]?.total ?? "0");
  const totalServiceRecords = Number(recordCountResult[0]?.count ?? 0);
  const openMaintenanceCount = allAlerts
    .flat()
    .filter((item) => item.dueStatus === "overdue" || item.dueStatus === "due-soon").length;

  return { vehicleCount, totalSpend, openMaintenanceCount, totalServiceRecords };
}

export async function getMaintenanceAlertsAcrossVehicles(userId: string) {
  const vehicles = await db
    .select({ id: vehicle.id, year: vehicle.year, make: vehicle.make, model: vehicle.model })
    .from(vehicle)
    .where(eq(vehicle.ownerId, userId));

  if (vehicles.length === 0) return [];

  const alertsPerVehicle = await Promise.all(
    vehicles.map(async (v) => {
      const alerts = await getUpcomingMaintenance(v.id);
      return { vehicle: v, alerts };
    }),
  );

  return alertsPerVehicle.filter((entry) =>
    entry.alerts.some((a) => a.dueStatus === "overdue" || a.dueStatus === "due-soon"),
  );
}

export async function getRecentActivityFeed(userId: string, limit = 5) {
  const ownedVehicles = await db
    .select({ id: vehicle.id })
    .from(vehicle)
    .where(eq(vehicle.ownerId, userId));

  const vehicleIds = ownedVehicles.map((v) => v.id);
  if (vehicleIds.length === 0) return [];

  return db.query.serviceRecords.findMany({
    where: (sr, { inArray }) => inArray(sr.vehicleId, vehicleIds),
    with: {
      vehicle: {
        columns: { id: true, year: true, make: true, model: true },
      },
    },
    orderBy: (sr, { desc }) => [desc(sr.serviceDate)],
    limit,
  });
}
