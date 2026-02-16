import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { getVehicle, getAllVehicles } from "~/server/actions/vehicles";
import { AddServiceForm } from "~/components/add-service-form";

export default async function AddServicePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const [vehicle, allVehicles] = await Promise.all([
    getVehicle(),
    getAllVehicles(session.user.id),
  ]);

  if (!vehicle) {
    redirect("/vehicle/add");
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold">Add Service Record</h1>
        <p className="text-muted-foreground mb-8">
          Keep your vehicle&apos;s maintenance history up to date by adding a new
          service record.
        </p>
        <AddServiceForm vehicle={vehicle} vehicles={allVehicles} />
      </div>
    </div>
  );
}
