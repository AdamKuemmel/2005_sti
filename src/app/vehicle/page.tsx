import { auth } from "~/server/auth";
import { getAllVehicles, getPublicVehicles } from "~/server/actions/vehicles";
import { DeleteVehicleButton } from "~/components/delete-vehicle-button";
import Link from "next/link";

export default async function VehiclesPage() {
  const session = await auth();

  if (session) {
    const [vehicles, allVehicles] = await Promise.all([
      getAllVehicles(session.user.id),
      getPublicVehicles(),
    ]);

    return (
      <div className="container mx-auto p-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">My Vehicles</h1>
            <Link
              href="/vehicle/add"
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Add Vehicle
            </Link>
          </div>

          {vehicles.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
              <p className="text-gray-500">No vehicles yet.</p>
              <Link
                href="/vehicle/add"
                className="mt-4 inline-block rounded bg-green-600 px-6 py-2 text-white hover:bg-green-700"
              >
                Add Your First Vehicle
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        {vehicle.currentMileage.toLocaleString()} miles
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/vehicle/history?vehicleId=${vehicle.id}`}
                        className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                      >
                        History
                      </Link>
                      <Link
                        href={`/vehicle/settings?vehicleId=${vehicle.id}`}
                        className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                      >
                        Settings
                      </Link>
                      <Link
                        href={`/vehicle/maintenance?vehicleId=${vehicle.id}`}
                        className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                      >
                        Maintenance
                      </Link>
                      <DeleteVehicleButton
                        vehicleId={vehicle.id}
                        vehicleName={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10">
          <h2 className="mb-4 text-2xl font-bold">All Vehicles</h2>
          {allVehicles.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
              <p className="text-gray-500">No vehicles have been added yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allVehicles.map((v) => (
                <div
                  key={v.id}
                  className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {v.year} {v.make} {v.model}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {v.currentMileage.toLocaleString()} miles
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/vehicle/history?vehicleId=${v.id}`}
                        className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                      >
                        History
                      </Link>
                      <Link
                        href={`/vehicle/maintenance?vehicleId=${v.id}`}
                        className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                      >
                        Maintenance
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Guest view — all vehicles, read-only
  const allVehicles = await getPublicVehicles();

  return (
    <div className="container mx-auto p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Vehicles</h1>
        </div>

        {allVehicles.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-500">No vehicles have been added yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {vehicle.currentMileage.toLocaleString()} miles
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/vehicle/history?vehicleId=${vehicle.id}`}
                      className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                    >
                      History
                    </Link>
                    <Link
                      href={`/vehicle/maintenance?vehicleId=${vehicle.id}`}
                      className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                    >
                      Maintenance
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
