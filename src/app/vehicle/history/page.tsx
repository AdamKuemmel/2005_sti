import { auth } from "~/server/auth";
import { getVehicle } from "~/server/actions/vehicles";
import { getServiceRecords } from "~/server/actions/service-records";
import { getUpcomingMaintenance } from "~/server/actions/maintenance";
import { getVehicleInteractions } from "~/server/actions/interactions";
import { ServiceRecordsList } from "~/components/service-records-list";
import { HistoryHeader } from "~/components/history-header";
import { UpcomingMaintenanceTable } from "~/components/upcoming-maintenance-table";
import { LikeButton } from "~/components/like-button";
import { CommentsSection } from "~/components/comments-section";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    vehicleId?: string;
  }>;
}

export default async function HistoryPage({ searchParams }: PageProps) {
  const session = await auth();
  const params = await searchParams;

  // Get the selected vehicle ID from URL or default to first vehicle
  const vehicleId = params.vehicleId ? parseInt(params.vehicleId) : undefined;

  const vehicle = await getVehicle(vehicleId);
  const [records, upcomingMaintenance, interactions] = vehicle
    ? await Promise.all([
        getServiceRecords(vehicle.id, params.category),
        getUpcomingMaintenance(vehicle.id),
        getVehicleInteractions(vehicle.id),
      ])
    : [[], [], null];

  if (!vehicle) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex flex-col items-center justify-center py-16">
          <h1 className="text-3xl font-bold">No vehicles available</h1>
          <p className="mt-4 text-muted-foreground">
            {session
              ? "Get started by adding your first vehicle."
              : "Check back later for vehicle maintenance history."}
          </p>
          {session && (
            <Link
              href="/vehicle/add"
              className="mt-6 rounded bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
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
      <HistoryHeader vehicle={vehicle} isOwner={session?.user?.id === vehicle.ownerId} />

      {interactions && (
        <div className="mb-8 -mt-4">
          <LikeButton
            vehicleId={vehicle.id}
            initialCount={interactions.likeCount}
            initialHasLiked={interactions.hasLiked}
            isLoggedIn={!!session}
          />
        </div>
      )}

      {/* Upcoming Maintenance Section */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Upcoming Maintenance</h2>
        <UpcomingMaintenanceTable
          items={upcomingMaintenance}
          currentMileage={vehicle.currentMileage}
        />
      </div>

      {/* Service History Section */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Service History</h2>
        <ServiceRecordsList
          records={records}
          currentCategory={params.category ?? "all"}
          isLoggedIn={!!session}
        />
      </div>

      {/* Comments Section */}
      {interactions && (
        <CommentsSection
          vehicleId={vehicle.id}
          initialComments={interactions.comments}
          currentUserId={session?.user?.id}
        />
      )}
    </div>
  );
}
