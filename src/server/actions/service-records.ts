"use server";

import { db } from "~/server/db";
import {
  serviceRecords,
  vehicle,
  maintenanceSchedule,
} from "~/server/db/schema";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, and, desc, inArray } from "drizzle-orm";

export async function addServiceRecord(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const vehicleId = parseInt(formData.get("vehicleId") as string);

  // Verify vehicle belongs to session user
  const [ownedVehicle] = await db
    .select()
    .from(vehicle)
    .where(and(eq(vehicle.id, vehicleId), eq(vehicle.ownerId, session.user.id)));

  if (!ownedVehicle) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const serviceDate = formData.get("serviceDate") as string;
  const mileage = parseInt(formData.get("mileage") as string);
  const location = formData.get("location") as string;
  const description = (formData.get("description") as string) ?? null;
  const partsBrand = (formData.get("partsBrand") as string) ?? null;
  const partNumber = (formData.get("partNumber") as string) ?? null;
  const laborCost = (formData.get("laborCost") as string) ?? null;
  const partsCost = (formData.get("partsCost") as string) ?? null;
  const notes = (formData.get("notes") as string) ?? null;

  const labor = laborCost ? parseFloat(laborCost) : 0;
  const parts = partsCost ? parseFloat(partsCost) : 0;
  const totalCost = labor + parts;

  const [record] = await db
    .insert(serviceRecords)
    .values({
      vehicleId,
      title,
      category,
      serviceDate,
      mileage,
      location: location ?? null,
      description,
      partsBrand,
      partNumber,
      laborCost: laborCost ?? null,
      partsCost: partsCost ?? null,
      totalCost: totalCost > 0 ? totalCost.toString() : null,
      notes,
      createdById: session.user.id,
    })
    .returning();

  // Update vehicle current mileage if this service mileage is higher
  const [currentVehicle] = await db
    .select()
    .from(vehicle)
    .where(eq(vehicle.id, vehicleId));

  if (currentVehicle && mileage > currentVehicle.currentMileage) {
    await db
      .update(vehicle)
      .set({ currentMileage: mileage, lastMileageUpdate: new Date() })
      .where(eq(vehicle.id, vehicleId));
  }

  // Find matching maintenance schedule item and update it
  if (record) {
    const matchingScheduleItems = await db
      .select()
      .from(maintenanceSchedule)
      .where(
        and(
          eq(maintenanceSchedule.vehicleId, vehicleId),
          eq(maintenanceSchedule.title, title),
          eq(maintenanceSchedule.isActive, true),
        ),
      );

    if (matchingScheduleItems.length > 0) {
      const scheduleItem = matchingScheduleItems[0]!;

      let nextDueMileage = null;
      let nextDueDate = null;

      if (scheduleItem.intervalMiles) {
        nextDueMileage = mileage + scheduleItem.intervalMiles;
      }

      if (scheduleItem.intervalMonths) {
        const serviceDateObj = new Date(serviceDate);
        serviceDateObj.setMonth(
          serviceDateObj.getMonth() + scheduleItem.intervalMonths,
        );
        nextDueDate = serviceDateObj.toISOString().split("T")[0];
      }

      await db
        .update(maintenanceSchedule)
        .set({
          lastServicedDate: serviceDate,
          lastServicedMileage: mileage,
          lastServiceRecordId: record.id,
          nextDueMileage,
          nextDueDate,
        })
        .where(eq(maintenanceSchedule.id, scheduleItem.id));
    }
  }

  revalidatePath("/history");
  redirect("/history");
}

export async function getServiceRecords(vehicleId?: number, category?: string) {
  // Specific vehicle ID: public, anyone can view
  if (vehicleId) {
    const conditions = [eq(serviceRecords.vehicleId, vehicleId)];

    if (category && category !== "all") {
      conditions.push(eq(serviceRecords.category, category));
    }

    return await db
      .select()
      .from(serviceRecords)
      .where(and(...conditions))
      .orderBy(desc(serviceRecords.serviceDate));
  }

  // No vehicle ID: scope to current user's vehicles
  const session = await auth();
  if (!session?.user?.id) return [];

  const ownedVehicleIds = db
    .select({ id: vehicle.id })
    .from(vehicle)
    .where(eq(vehicle.ownerId, session.user.id));

  const conditions = [inArray(serviceRecords.vehicleId, ownedVehicleIds)];

  if (category && category !== "all") {
    conditions.push(eq(serviceRecords.category, category));
  }

  return await db
    .select()
    .from(serviceRecords)
    .where(and(...conditions))
    .orderBy(desc(serviceRecords.serviceDate));
}

export async function searchServiceRecords(_searchTerm: string) {
  // TODO: implement full-text search
  return [];
}

export async function deleteServiceRecord(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const recordId = parseInt(formData.get("recordId") as string);

  const [record] = await db
    .select()
    .from(serviceRecords)
    .where(eq(serviceRecords.id, recordId));

  if (!record) throw new Error("Record not found");

  const [ownedVehicle] = await db
    .select()
    .from(vehicle)
    .where(and(eq(vehicle.id, record.vehicleId), eq(vehicle.ownerId, session.user.id)));

  if (!ownedVehicle) throw new Error("Unauthorized");

  await db.delete(serviceRecords).where(eq(serviceRecords.id, recordId));

  revalidatePath("/vehicle/history");
  revalidatePath("/vehicle/edit");
}
