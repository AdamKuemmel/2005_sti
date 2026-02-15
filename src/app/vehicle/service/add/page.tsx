import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { getVehicle } from "~/server/actions/vehicles";
import { AddServiceForm } from "~/components/add-service-form";

export default async function AddServicePage() {
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
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold">Add Service Record</h1>
        <AddServiceForm vehicle={vehicle} />
      </div>
    </div>
  );
}
