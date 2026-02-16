import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { getVehicle } from "~/server/actions/vehicles";
import { SetupMaintenanceForm } from "~/components/setup-maintenance-form";

export default async function SetupMaintenancePage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const vehicle = await getVehicle();

  if (!vehicle) {
    redirect("/vehicle/add");
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-3xl font-bold">Setup Maintenance Schedule</h1>
        <p className="mb-6 text-muted-foreground">
          Review and customize the maintenance intervals for your {vehicle.year}{" "}
          {vehicle.make} {vehicle.model}. These are based on the official Subaru
          service manual, but you can adjust them to be more conservative.
        </p>

        <SetupMaintenanceForm vehicle={vehicle} />
      </div>
    </div>
  );
}
