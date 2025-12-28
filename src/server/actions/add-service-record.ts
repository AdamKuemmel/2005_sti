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
import { eq, and } from "drizzle-orm";

export async function addServiceRecord(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const vehicleId = parseInt(formData.get("vehicleId") as string);
  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const serviceDate = formData.get("serviceDate") as string;
  const mileage = parseInt(formData.get("mileage") as string);
  const location = formData.get("location") as string;
  const description = (formData.get("description") as string) || null;
  const partsBrand = (formData.get("partsBrand") as string) || null;
  const partNumber = (formData.get("partNumber") as string) || null;
  const laborCost = (formData.get("laborCost") as string) || null;
  const partsCost = (formData.get("partsCost") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  // Calculate total cost
  const labor = laborCost ? parseFloat(laborCost) : 0;
  const parts = partsCost ? parseFloat(partsCost) : 0;
  const totalCost = labor + parts;

  // Insert the service record
  const [record] = await db
    .insert(serviceRecords)
    .values({
      vehicleId,
      title,
      category,
      serviceDate,
      mileage,
      location: location || null,
      description,
      partsBrand,
      partNumber,
      laborCost: laborCost || null,
      partsCost: partsCost || null,
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
      .set({
        currentMileage: mileage,
        lastMileageUpdate: new Date(),
      })
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

      // Calculate next due dates based on the service just performed
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

      // Update the maintenance schedule item
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
