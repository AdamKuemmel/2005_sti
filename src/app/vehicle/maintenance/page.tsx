import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { getVehicle } from "~/server/actions/vehicles";
import { db } from "~/server/db";
import { maintenanceSchedule } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { EditMaintenanceForm } from "~/components/edit-maintenance-form";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ vehicleId?: string }>;
}

export default async function VehicleMaintenancePage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const params = await searchParams;
  const vehicleId = params.vehicleId ? parseInt(params.vehicleId) : undefined;
  const vehicle = await getVehicle(vehicleId);

  if (!vehicle) {
    redirect("/vehicle");
  }

  const existingSchedule = await db
    .select()
    .from(maintenanceSchedule)
    .where(eq(maintenanceSchedule.vehicleId, vehicle.id));

  return (
    <div className="container mx-auto p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/vehicle" className="text-sm text-gray-500 hover:text-gray-700">
            ← My Vehicles
          </Link>
        </div>

        <h1 className="mb-2 text-3xl font-bold">
          {existingSchedule.length > 0 ? "Edit" : "Setup"} Maintenance Schedule
        </h1>
        <p className="mb-6 text-gray-600">
          {existingSchedule.length > 0
            ? `Review and update the maintenance intervals for your ${vehicle.year} ${vehicle.make} ${vehicle.model}.`
            : `Setup maintenance intervals for your ${vehicle.year} ${vehicle.make} ${vehicle.model}.`}
        </p>

        <EditMaintenanceForm vehicle={vehicle} existingSchedule={existingSchedule} />
      </div>
    </div>
  );
}
