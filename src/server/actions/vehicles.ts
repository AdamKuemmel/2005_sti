"use server";

import { db } from "~/server/db";
import { vehicle, serviceRecords, maintenanceSchedule } from "~/server/db/schema";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { seedMaintenanceSchedule } from "~/server/actions/maintenance";

export async function addVehicle(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const year = parseInt(formData.get("year") as string);
  const make = formData.get("make") as string;
  const model = formData.get("model") as string;
  const currentMileage = parseInt(formData.get("currentMileage") as string);

  const [newVehicle] = await db
    .insert(vehicle)
    .values({
      year,
      make,
      model,
      currentMileage,
      lastMileageUpdate: new Date(),
      ownerId: session.user.id,
    })
    .returning();

  if (newVehicle) {
    await seedMaintenanceSchedule(newVehicle.id);
  }

  revalidatePath("/vehicle/history");
  redirect("/vehicle/history");
}

export async function updateVehicle(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const vehicleId = parseInt(formData.get("vehicleId") as string);

  // Verify ownership before updating
  const [existing] = await db
    .select()
    .from(vehicle)
    .where(eq(vehicle.id, vehicleId));

  if (!existing) {
    throw new Error("Vehicle not found");
  }

  if (existing.ownerId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const year = parseInt(formData.get("year") as string);
  const make = formData.get("make") as string;
  const model = formData.get("model") as string;
  const currentMileage = parseInt(formData.get("currentMileage") as string);

  await db
    .update(vehicle)
    .set({
      year,
      make,
      model,
      currentMileage,
      lastMileageUpdate: new Date(),
    })
    .where(eq(vehicle.id, vehicleId));

  const redirectTo = (formData.get("redirectTo") as string) ?? "/vehicle";
  revalidatePath("/vehicle/history");
  revalidatePath("/vehicle");
  redirect(redirectTo);
}

export async function getVehicle(vehicleId?: number) {
  // Specific vehicle ID: public, anyone can view
  if (vehicleId) {
    const vehicles = await db
      .select()
      .from(vehicle)
      .where(eq(vehicle.id, vehicleId))
      .limit(1);
    return vehicles[0] ?? null;
  }

  // No ID: return the current user's first vehicle
  const session = await auth();
  if (!session?.user?.id) return null;

  const vehicles = await db
    .select()
    .from(vehicle)
    .where(eq(vehicle.ownerId, session.user.id))
    .limit(1);
  return vehicles[0] ?? null;
}

export async function getAllVehicles(userId: string) {
  return await db.select().from(vehicle).where(eq(vehicle.ownerId, userId));
}

export async function getPublicVehicles() {
  return await db.select().from(vehicle);
}

export async function deleteVehicle(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const vehicleId = parseInt(formData.get("vehicleId") as string);

  // Verify ownership before deleting
  const [existing] = await db
    .select()
    .from(vehicle)
    .where(eq(vehicle.id, vehicleId));

  if (!existing) {
    throw new Error("Vehicle not found");
  }

  if (existing.ownerId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  // 1. Delete maintenance schedule (has FK to both vehicle and serviceRecords)
  await db
    .delete(maintenanceSchedule)
    .where(eq(maintenanceSchedule.vehicleId, vehicleId));

  // 2. Delete service records (serviceDocuments cascade via onDelete: "cascade")
  await db
    .delete(serviceRecords)
    .where(eq(serviceRecords.vehicleId, vehicleId));

  // 3. Delete the vehicle itself
  await db.delete(vehicle).where(eq(vehicle.id, vehicleId));

  revalidatePath("/vehicle");
  redirect("/vehicle");
}
