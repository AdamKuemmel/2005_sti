import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { getVehicle } from "~/server/actions/vehicles";
import { updateVehicle } from "~/server/actions/vehicles";
import Link from "next/link";

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

  return (
    <div className="container mx-auto p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/vehicle" className="text-sm text-gray-500 hover:text-gray-700">
            ← My Vehicles
          </Link>
        </div>

        <h1 className="mb-2 text-3xl font-bold">Vehicle Settings</h1>
        <p className="mb-6 text-gray-600">
          Update the details for your {vehicle.year} {vehicle.make} {vehicle.model}.
        </p>

        <form action={updateVehicle} className="space-y-6">
          <input type="hidden" name="vehicleId" value={vehicle.id} />
          <input type="hidden" name="redirectTo" value="/vehicle" />

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700">
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
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="make" className="block text-sm font-medium text-gray-700">
              Make
            </label>
            <input
              type="text"
              id="make"
              name="make"
              required
              defaultValue={vehicle.make}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700">
              Model
            </label>
            <input
              type="text"
              id="model"
              name="model"
              required
              defaultValue={vehicle.model}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="currentMileage" className="block text-sm font-medium text-gray-700">
              Current Mileage
            </label>
            <input
              type="number"
              id="currentMileage"
              name="currentMileage"
              required
              min="0"
              defaultValue={vehicle.currentMileage}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Save Changes
            </button>
            <Link
              href="/vehicle"
              className="rounded bg-gray-200 px-6 py-2 text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
