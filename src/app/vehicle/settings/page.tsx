import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { getVehicle, getVehiclePhotos, updateVehicle } from "~/server/actions/vehicles";
import Link from "next/link";
import { VehiclePhotoManager } from "~/components/vehicle-photo-manager";

interface PageProps {
  searchParams: Promise<{ vehicleId?: string }>;
}

export default async function VehicleSettingsPage({ searchParams }: PageProps) {
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

  const photos = await getVehiclePhotos(vehicle.id);

  return (
    <div className="container mx-auto p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/vehicle" className="text-sm text-muted-foreground hover:text-foreground">
            ← My Vehicles
          </Link>
        </div>

        <h1 className="mb-2 text-3xl font-bold">Vehicle Settings</h1>
        <p className="mb-6 text-muted-foreground">
          Update the details for your {vehicle.year} {vehicle.make} {vehicle.model}.
        </p>

        <form action={updateVehicle} className="space-y-6">
          <input type="hidden" name="vehicleId" value={vehicle.id} />
          <input type="hidden" name="redirectTo" value="/vehicle" />

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-foreground">
              Year
            </label>
            <input
              type="number"
              id="year"
              name="year"
              required
              defaultValue={vehicle.year}
              min="1900"
              max={new Date().getFullYear() + 1}
              className="mt-1 block w-full rounded-md border border-input px-3 py-2 shadow-sm focus:border-ring focus:ring-ring focus:ring-1 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="make" className="block text-sm font-medium text-foreground">
              Make
            </label>
            <input
              type="text"
              id="make"
              name="make"
              required
              defaultValue={vehicle.make}
              className="mt-1 block w-full rounded-md border border-input px-3 py-2 shadow-sm focus:border-ring focus:ring-ring focus:ring-1 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-foreground">
              Model
            </label>
            <input
              type="text"
              id="model"
              name="model"
              required
              defaultValue={vehicle.model}
              className="mt-1 block w-full rounded-md border border-input px-3 py-2 shadow-sm focus:border-ring focus:ring-ring focus:ring-1 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="currentMileage" className="block text-sm font-medium text-foreground">
              Current Mileage
            </label>
            <input
              type="number"
              id="currentMileage"
              name="currentMileage"
              required
              min="0"
              defaultValue={vehicle.currentMileage}
              className="mt-1 block w-full rounded-md border border-input px-3 py-2 shadow-sm focus:border-ring focus:ring-ring focus:ring-1 focus:outline-none"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="rounded bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Save Changes
            </button>
            <Link
              href="/vehicle"
              className="rounded bg-secondary px-6 py-2 text-foreground hover:bg-secondary"
            >
              Cancel
            </Link>
          </div>
        </form>

        <VehiclePhotoManager vehicleId={vehicle.id} initialPhotos={photos} />
      </div>
    </div>
  );
}
