import { auth } from "~/server/auth";
import {
  getVehicle,
  getServiceRecords,
  getUpcomingMaintenance,
} from "~/server/actions/service-records";

import { HistoryHeader } from "~/components/history-header";
import { UpcomingMaintenanceTable } from "~/components/upcoming-maintenance-table";
import Link from "next/link";
import { ServiceRecordsList } from "~/components/service-records-list";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string; vehicleId?: string };
}) {
  const session = await auth();

  // Get the selected vehicle ID from URL or default to first vehicle
  const vehicleId = searchParams.vehicleId
    ? parseInt(searchParams.vehicleId)
    : undefined;

  const vehicle = await getVehicle(vehicleId);
  const records = vehicle
    ? await getServiceRecords(vehicle.id, searchParams.category)
    : [];
  const upcomingMaintenance = vehicle
    ? await getUpcomingMaintenance(vehicle.id)
    : [];

  if (!vehicle) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex flex-col items-center justify-center py-16">
          <h1 className="text-3xl font-bold">No vehicles available</h1>
          <p className="mt-4 text-gray-600">
            {session
              ? "Get started by adding your first vehicle."
              : "Check back later for vehicle maintenance history."}
          </p>
          {session && (
            <Link
              href="/vehicle/add"
              className="mt-6 rounded bg-green-600 px-6 py-3 text-white hover:bg-green-700"
            >
              Add Vehicle
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <HistoryHeader vehicle={vehicle} isLoggedIn={!!session} />

      {/* Upcoming Maintenance Section */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Upcoming Maintenance</h2>
        <UpcomingMaintenanceTable
          items={upcomingMaintenance}
          currentMileage={vehicle.currentMileage}
        />
      </div>

      {/* Service History Section */}
      <div>
        <h2 className="mb-4 text-2xl font-bold">Service History</h2>
        <ServiceRecordsList
          records={records}
          currentCategory={searchParams.category ?? "all"}
          isLoggedIn={!!session}
        />
      </div>
    </div>
  );
}
