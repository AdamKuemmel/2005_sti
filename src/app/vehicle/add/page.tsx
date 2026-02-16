import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { AddVehicleForm } from "~/components/add-vehicle-form";

export default async function AddVehiclePage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold">Add Vehicle</h1>
        <AddVehicleForm />
      </div>
    </div>
  );
}
