import VehicleCard from "~/app/vehicle/components/VehicleCard";
import type { vehicle, vehiclePhotos } from "~/server/db/schema";
type Vehicle = typeof vehicle.$inferSelect;
type VehiclePhoto = typeof vehiclePhotos.$inferSelect;
type VehicleWithPhotos = Vehicle & { photos: VehiclePhoto[] };

export function FeaturedCarsSection({
  vehicles,
  currentUserId,
}: {
  vehicles: VehicleWithPhotos[];
  currentUserId?: string;
}) {
  if (vehicles.length === 0) {
    return null;
  }
  console.log(!!currentUserId, "currentUserId", currentUserId);
  return (
    <section className="bg-muted px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <h2 className="text-foreground text-3xl font-bold">
            Featured Vehicles
          </h2>
          <p className="text-muted-foreground mt-2">
            Community builds with documented histories
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              isOwner={!!currentUserId && v.ownerId === currentUserId}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
