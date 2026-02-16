import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { getVehicle } from "~/server/actions/vehicles";
import { getFullMaintenanceSchedule } from "~/server/actions/maintenance";
import { MaintenanceScheduleTable } from "~/components/maintenance-schedule-table";
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

  if (vehicle.ownerId !== session.user.id) {
    redirect("/vehicle");
  }

  const schedule = await getFullMaintenanceSchedule(vehicle.id);
  const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  return (
    <div className="container mx-auto p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link
            href={`/vehicle/history?vehicleId=${vehicle.id}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to {vehicleName}
          </Link>
        </div>

        <h1 className="mb-1 text-3xl font-bold">Maintenance Schedule</h1>
        <p className="mb-8 text-muted-foreground">{vehicleName}</p>

        <MaintenanceScheduleTable
          items={schedule}
          currentMileage={vehicle.currentMileage}
          vehicleId={vehicle.id}
          isOwner={true}
          showAll={true}
        />
      </div>
    </div>
  );
}
