"use server";

import { db } from "~/server/db";
import { vehicle } from "~/server/db/schema";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { seedMaintenanceSchedule } from "~/server/actions/seed-maintenance";

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

  // Automatically seed maintenance schedule for new vehicle
  if (newVehicle) {
    await seedMaintenanceSchedule(newVehicle.id);
  }

  revalidatePath("/history");
  redirect("/history");
}
