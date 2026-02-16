import { auth } from "~/server/auth";
import { getVehicle, getVehiclePhotos, getVehicleOwner } from "~/server/actions/vehicles";
import { getServiceRecords } from "~/server/actions/service-records";
import { getFullMaintenanceSchedule } from "~/server/actions/maintenance";
import { getVehicleInteractions } from "~/server/actions/interactions";
import { ServiceRecordsList } from "~/components/service-records-list";
import { HistoryHeader } from "~/components/history-header";
import { MaintenanceScheduleTable } from "~/components/maintenance-schedule-table";
import { LikeButton } from "~/components/like-button";
import { CommentsSection } from "~/components/comments-section";
import { VehiclePhotoGallery } from "~/components/vehicle-photo-gallery";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    vehicleId?: string;
  }>;
}

const CATEGORY_STYLES: Record<string, { label: string; className: string }> = {
  fluid: {
    label: "Fluids",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  engine_drivetrain: {
    label: "Engine / Drivetrain",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  },
  consumable: {
    label: "Consumables",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  inspection: {
    label: "Inspection",
    className:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  },
  other: { label: "Other", className: "bg-muted text-muted-foreground" },
};

export default async function HistoryPage({ searchParams }: PageProps) {
  const session = await auth();
  const params = await searchParams;

  const vehicleId = params.vehicleId ? parseInt(params.vehicleId) : undefined;
  const vehicle = await getVehicle(vehicleId);

  const [records, upcomingMaintenance, interactions, photos, owner] = vehicle
    ? await Promise.all([
        getServiceRecords(vehicle.id, params.category),
        getFullMaintenanceSchedule(vehicle.id),
        getVehicleInteractions(vehicle.id),
        getVehiclePhotos(vehicle.id),
        getVehicleOwner(vehicle.ownerId),
      ])
    : [[], [], null, [], null];

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

  const recentRecords = records.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-6 sm:px-8 sm:py-8">
      <HistoryHeader
        vehicle={vehicle}
        isOwner={session?.user?.id === vehicle.ownerId}
        owner={owner}
      />

      {interactions && (
        <div className="mb-6 -mt-4">
          <LikeButton
            vehicleId={vehicle.id}
            initialCount={interactions.likeCount}
            initialHasLiked={interactions.hasLiked}
            isLoggedIn={!!session}
          />
        </div>
      )}

      {/* Photo Gallery */}
      <VehiclePhotoGallery photos={photos} />

      {/* Recent Work */}
      {recentRecords.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-4 text-2xl font-bold">Recent Work</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {recentRecords.map((record) => {
              const cat =
                CATEGORY_STYLES[record.category] ?? CATEGORY_STYLES.other!;
              return (
                <div
                  key={record.id}
                  className="bg-card border-border flex flex-col gap-3 rounded-xl border p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cat.className}`}
                    >
                      {cat.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(record.serviceDate).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold leading-tight">
                      {record.title}
                    </h3>
                    {record.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {record.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-auto flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {record.mileage.toLocaleString()} mi
                    </span>
                    {record.totalCost && (
                      <span className="font-medium text-primary">
                        ${parseFloat(record.totalCost).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Maintenance */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Upcoming Maintenance</h2>
        <MaintenanceScheduleTable
          items={upcomingMaintenance}
          currentMileage={vehicle.currentMileage}
          vehicleId={vehicle.id}
          isOwner={session?.user?.id === vehicle.ownerId}
          showAll={false}
        />
      </div>

      {/* Full Service History */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Service History</h2>
        <ServiceRecordsList
          records={records}
          currentCategory={params.category ?? "all"}
          isOwner={session?.user?.id === vehicle.ownerId}
        />
      </div>

      {/* Comments */}
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
