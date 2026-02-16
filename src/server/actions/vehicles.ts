"use server";

import { db } from "~/server/db";
import {
  vehicle,
  vehiclePhotos,
  serviceRecords,
  maintenanceSchedule,
} from "~/server/db/schema";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { seedMaintenanceSchedule } from "~/server/actions/maintenance";
import { UTApi } from "uploadthing/server";

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

    const photosJson = formData.get("photos") as string;
    const photos = photosJson
      ? (JSON.parse(photosJson) as { fileUrl: string; fileKey: string }[])
      : [];
    if (photos.length > 0) {
      await db.insert(vehiclePhotos).values(
        photos.map((p, i) => ({
          vehicleId: newVehicle.id,
          fileUrl: p.fileUrl,
          fileKey: p.fileKey,
          isPrimary: i === 0,
        })),
      );
    }
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
  return await db.query.vehicle.findMany({
    limit: 6,
    with: {
      photos: true,
    },
    where: (v, { eq }) => eq(v.ownerId, userId),
  });
}

export async function getPublicVehicles() {
  return await db.query.vehicle.findMany({
    limit: 6,
    with: {
      photos: true,
    },
  });
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

  // 3. Delete the vehicle itself (vehiclePhotos cascade via onDelete: "cascade")
  await db.delete(vehicle).where(eq(vehicle.id, vehicleId));

  revalidatePath("/vehicle");
  redirect("/vehicle");
}

export async function getVehiclePhotos(vehicleId: number) {
  return await db
    .select()
    .from(vehiclePhotos)
    .where(eq(vehiclePhotos.vehicleId, vehicleId));
}

export async function saveVehiclePhotos(
  vehicleId: number,
  photos: { fileUrl: string; fileKey: string }[],
  setFirstAsPrimary = false,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [existing] = await db
    .select()
    .from(vehicle)
    .where(
      and(eq(vehicle.id, vehicleId), eq(vehicle.ownerId, session.user.id)),
    );

  if (!existing) throw new Error("Vehicle not found");

  const inserted = await db
    .insert(vehiclePhotos)
    .values(
      photos.map((p, i) => ({
        vehicleId,
        fileUrl: p.fileUrl,
        fileKey: p.fileKey,
        isPrimary: setFirstAsPrimary && i === 0,
      })),
    )
    .returning();

  revalidatePath(`/vehicle/settings`);
  return inserted;
}

export async function deleteVehiclePhoto(photoId: number, fileKey: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [photo] = await db
    .select()
    .from(vehiclePhotos)
    .where(eq(vehiclePhotos.id, photoId));

  if (!photo) throw new Error("Photo not found");

  const [v] = await db
    .select()
    .from(vehicle)
    .where(
      and(
        eq(vehicle.id, photo.vehicleId),
        eq(vehicle.ownerId, session.user.id),
      ),
    );

  if (!v) throw new Error("Unauthorized");

  const utapi = new UTApi();
  await utapi.deleteFiles(fileKey);

  await db.delete(vehiclePhotos).where(eq(vehiclePhotos.id, photoId));

  revalidatePath(`/vehicle/settings`);
}
