"use server";

import { db } from "~/server/db";
import {
  serviceRecords,
  serviceDocuments,
  serviceRecordSteps,
  serviceStepPhotos,
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
    .where(
      and(eq(vehicle.id, vehicleId), eq(vehicle.ownerId, session.user.id)),
    );

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

  // Insert steps (and their photos)
  if (record) {
    const stepsJson = formData.get("stepsJson") as string;
    if (stepsJson) {
      const stepsData = JSON.parse(stepsJson) as {
        stepNumber: number;
        title: string;
        description: string;
        photos: { fileUrl: string; fileKey: string }[];
      }[];

      for (const stepData of stepsData) {
        if (!stepData.title.trim()) continue;
        const [insertedStep] = await db
          .insert(serviceRecordSteps)
          .values({
            serviceRecordId: record.id,
            stepNumber: stepData.stepNumber,
            title: stepData.title,
            description: stepData.description || null,
          })
          .returning();

        if (insertedStep && stepData.photos.length > 0) {
          await db.insert(serviceStepPhotos).values(
            stepData.photos.map((p) => ({
              stepId: insertedStep.id,
              fileUrl: p.fileUrl,
              fileKey: p.fileKey,
            })),
          );
        }
      }
    }

    // Insert service-level documents (receipts, reference photos)
    const documentsJson = formData.get("documentsJson") as string;
    if (documentsJson) {
      const docsData = JSON.parse(documentsJson) as {
        fileUrl: string;
        fileKey: string;
        fileType: string;
      }[];

      if (docsData.length > 0) {
        await db.insert(serviceDocuments).values(
          docsData.map((d) => ({
            serviceRecordId: record.id,
            fileUrl: d.fileUrl,
            fileKey: d.fileKey ?? null,
            fileType: d.fileType,
          })),
        );
      }
    }
  }

  revalidatePath("/vehicle/history?vehicleId=" + vehicleId);
  redirect("/vehicle/history?vehicleId=" + vehicleId);
}

export async function updateServiceRecord(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const recordId = parseInt(formData.get("recordId") as string);

  const [existing] = await db
    .select()
    .from(serviceRecords)
    .where(
      and(
        eq(serviceRecords.id, recordId),
        eq(serviceRecords.createdById, session.user.id),
      ),
    );

  if (!existing) throw new Error("Record not found or unauthorized");

  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const serviceDate = formData.get("serviceDate") as string;
  const mileage = parseInt(formData.get("mileage") as string);
  const location = (formData.get("location") as string) || null;
  const description = (formData.get("description") as string) || null;
  const partsBrand = (formData.get("partsBrand") as string) || null;
  const partNumber = (formData.get("partNumber") as string) || null;
  const laborCost = (formData.get("laborCost") as string) || null;
  const partsCost = (formData.get("partsCost") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  const labor = laborCost ? parseFloat(laborCost) : 0;
  const parts = partsCost ? parseFloat(partsCost) : 0;
  const totalCost = labor + parts;

  await db
    .update(serviceRecords)
    .set({
      title,
      category,
      serviceDate,
      mileage,
      location,
      description,
      partsBrand,
      partNumber,
      laborCost,
      partsCost,
      totalCost: totalCost > 0 ? totalCost.toString() : null,
      notes,
    })
    .where(eq(serviceRecords.id, recordId));

  // Update vehicle mileage if higher
  const [currentVehicle] = await db
    .select()
    .from(vehicle)
    .where(eq(vehicle.id, existing.vehicleId));

  if (currentVehicle && mileage > currentVehicle.currentMileage) {
    await db
      .update(vehicle)
      .set({ currentMileage: mileage, lastMileageUpdate: new Date() })
      .where(eq(vehicle.id, existing.vehicleId));
  }

  // Replace steps: delete all existing, re-insert from form
  await db
    .delete(serviceRecordSteps)
    .where(eq(serviceRecordSteps.serviceRecordId, recordId));

  const stepsJson = formData.get("stepsJson") as string;
  if (stepsJson) {
    const stepsData = JSON.parse(stepsJson) as {
      stepNumber: number;
      title: string;
      description: string;
      photos: { fileUrl: string; fileKey: string }[];
    }[];

    for (const stepData of stepsData) {
      if (!stepData.title.trim()) continue;
      const [insertedStep] = await db
        .insert(serviceRecordSteps)
        .values({
          serviceRecordId: recordId,
          stepNumber: stepData.stepNumber,
          title: stepData.title,
          description: stepData.description || null,
        })
        .returning();

      if (insertedStep && stepData.photos.length > 0) {
        await db.insert(serviceStepPhotos).values(
          stepData.photos.map((p) => ({
            stepId: insertedStep.id,
            fileUrl: p.fileUrl,
            fileKey: p.fileKey,
          })),
        );
      }
    }
  }

  // Replace documents: delete all existing, re-insert from form
  await db
    .delete(serviceDocuments)
    .where(eq(serviceDocuments.serviceRecordId, recordId));

  const documentsJson = formData.get("documentsJson") as string;
  if (documentsJson) {
    const docsData = JSON.parse(documentsJson) as {
      fileUrl: string;
      fileKey: string | null;
      fileType: string;
    }[];

    if (docsData.length > 0) {
      await db.insert(serviceDocuments).values(
        docsData.map((d) => ({
          serviceRecordId: recordId,
          fileUrl: d.fileUrl,
          fileKey: d.fileKey ?? null,
          fileType: d.fileType,
        })),
      );
    }
  }

  revalidatePath("/vehicle/history");
  revalidatePath("/vehicle/edit");
  redirect(`/vehicle/history?vehicleId=${existing.vehicleId}`);
}

export async function getServiceRecords(vehicleId?: number, category?: string) {
  // Specific vehicle ID: public, anyone can view
  if (vehicleId) {
    return db.query.serviceRecords.findMany({
      where: (sr, { eq, and }) =>
        category && category !== "all"
          ? and(eq(sr.vehicleId, vehicleId), eq(sr.category, category))
          : eq(sr.vehicleId, vehicleId),
      with: {
        steps: {
          orderBy: (s, { asc }) => [asc(s.stepNumber)],
          with: { photos: true },
        },
        documents: true,
      },
      orderBy: (sr, { desc }) => [desc(sr.serviceDate)],
    });
  }

  // No vehicle ID: scope to current user's vehicles
  const session = await auth();
  if (!session?.user?.id) return [];

  const ownedVehicles = await db
    .select({ id: vehicle.id })
    .from(vehicle)
    .where(eq(vehicle.ownerId, session.user.id));

  const vehicleIds = ownedVehicles.map((v) => v.id);
  if (vehicleIds.length === 0) return [];

  return db.query.serviceRecords.findMany({
    where: (sr, { inArray, eq, and }) => {
      const base = inArray(sr.vehicleId, vehicleIds);
      return category && category !== "all"
        ? and(base, eq(sr.category, category))
        : base;
    },
    with: {
      steps: {
        orderBy: (s, { asc }) => [asc(s.stepNumber)],
        with: { photos: true },
      },
      documents: true,
    },
    orderBy: (sr, { desc }) => [desc(sr.serviceDate)],
  });
}

export async function getServiceRecord(recordId: number) {
  return db.query.serviceRecords.findFirst({
    where: (sr, { eq }) => eq(sr.id, recordId),
    with: {
      steps: {
        orderBy: (s, { asc }) => [asc(s.stepNumber)],
        with: { photos: true },
      },
      documents: true,
    },
  });
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
    .where(
      and(
        eq(vehicle.id, record.vehicleId),
        eq(vehicle.ownerId, session.user.id),
      ),
    );

  if (!ownedVehicle) throw new Error("Unauthorized");

  await db.delete(serviceRecords).where(eq(serviceRecords.id, recordId));

  revalidatePath("/vehicle/history");
  revalidatePath("/vehicle/edit");
}
