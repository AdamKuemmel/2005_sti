import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import {
  getVehicle,
  getVehiclePhotos,
  updateVehicle,
} from "~/server/actions/vehicles";
import { getServiceRecords } from "~/server/actions/service-records";
import { getVehicleInteractions } from "~/server/actions/interactions";
import { db } from "~/server/db";
import { maintenanceSchedule } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { VehiclePhotoManager } from "~/components/vehicle-photo-manager";
import { ServiceRecordsList } from "~/components/service-records-list";
import { MaintenanceScheduleTable } from "~/components/maintenance-schedule-table";
import { OwnerCommentsManager } from "~/components/owner-comments-manager";
import { DeleteVehicleButton } from "~/components/delete-vehicle-button";

interface PageProps {
  searchParams: Promise<{ vehicleId?: string }>;
}

export default async function VehicleEditPage({ searchParams }: PageProps) {
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

  if (vehicle.ownerId !== session.user.id) {
    redirect("/vehicle");
  }

  const [photos, records, interactions, maintenanceItems] = await Promise.all([
    getVehiclePhotos(vehicle.id),
    getServiceRecords(vehicle.id),
    getVehicleInteractions(vehicle.id),
    db
      .select()
      .from(maintenanceSchedule)
      .where(eq(maintenanceSchedule.vehicleId, vehicle.id))
      .orderBy(maintenanceSchedule.category, maintenanceSchedule.title),
  ]);

  const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  return (
    <div className="container mx-auto px-4 py-6 sm:px-8 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4">
          <Link
            href={`/vehicle`}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ← Back to Garage
          </Link>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Edit Vehicle</h1>
            <p className="text-muted-foreground mt-1">{vehicleName}</p>
          </div>
          <DeleteVehicleButton
            vehicleId={vehicle.id}
            vehicleName={vehicleName}
          />
        </div>

        {/* Section nav */}
        <div className="mt-6 flex flex-wrap gap-2">
          {[
            { href: "#details", label: "Details" },
            { href: "#service", label: `Service Records (${records.length})` },
            {
              href: "#maintenance",
              label: `Maintenance (${maintenanceItems.length})`,
            },
            {
              href: "#community",
              label: `Community (${interactions?.comments.length ?? 0})`,
            },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="border-border text-muted-foreground hover:border-primary hover:text-primary rounded-full border px-3 py-1 text-sm"
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* ─── Vehicle Details ─── */}
      <section id="details" className="mb-12 scroll-mt-6">
        <h2 className="mb-4 text-2xl font-bold">Vehicle Details</h2>

        <div className="border-border bg-card rounded-xl border p-6">
          <form action={updateVehicle} className="space-y-4">
            <input type="hidden" name="vehicleId" value={vehicle.id} />
            <input
              type="hidden"
              name="redirectTo"
              value={`/vehicle/edit?vehicleId=${vehicle.id}`}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="year" className="block text-sm font-medium">
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
                  className="border-input focus:border-ring focus:ring-ring mt-1 block w-full rounded-md border px-3 py-2 focus:ring-1 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="make" className="block text-sm font-medium">
                  Make
                </label>
                <input
                  type="text"
                  id="make"
                  name="make"
                  required
                  defaultValue={vehicle.make}
                  className="border-input focus:border-ring focus:ring-ring mt-1 block w-full rounded-md border px-3 py-2 focus:ring-1 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="model" className="block text-sm font-medium">
                  Model
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  required
                  defaultValue={vehicle.model}
                  className="border-input focus:border-ring focus:ring-ring mt-1 block w-full rounded-md border px-3 py-2 focus:ring-1 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="currentMileage"
                  className="block text-sm font-medium"
                >
                  Current Mileage
                </label>
                <input
                  type="number"
                  id="currentMileage"
                  name="currentMileage"
                  required
                  min="0"
                  defaultValue={vehicle.currentMileage}
                  className="border-input focus:border-ring focus:ring-ring mt-1 block w-full rounded-md border px-3 py-2 focus:ring-1 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-5 py-2 text-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6">
          <VehiclePhotoManager vehicleId={vehicle.id} initialPhotos={photos} />
        </div>
      </section>

      {/* ─── Service Records ─── */}
      <section id="service" className="mb-12 scroll-mt-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Service Records</h2>
          <Link
            href={`/vehicle/service/add`}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2 text-sm"
          >
            + Add Record
          </Link>
        </div>
        <ServiceRecordsList records={records} isOwner={true} />
      </section>

      {/* ─── Maintenance Schedule ─── */}
      <section id="maintenance" className="mb-12 scroll-mt-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Maintenance Schedule</h2>
        </div>
        <MaintenanceScheduleTable
          items={maintenanceItems}
          currentMileage={vehicle.currentMileage}
          vehicleId={vehicle.id}
          isOwner={true}
          showAll={true}
        />
      </section>

      {/* ─── Community ─── */}
      <section id="community" className="mb-12 scroll-mt-6">
        <h2 className="mb-4 text-2xl font-bold">Community</h2>

        <div className="border-border bg-card mb-4 flex items-center gap-3 rounded-xl border px-5 py-3">
          <span className="text-muted-foreground text-sm">Likes</span>
          <span className="text-lg font-semibold">
            {interactions?.likeCount ?? 0}
          </span>
        </div>

        <OwnerCommentsManager
          vehicleId={vehicle.id}
          initialComments={interactions?.comments ?? []}
          currentUserId={session.user.id}
        />
      </section>
    </div>
  );
}
