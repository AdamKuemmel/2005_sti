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
import { OwnerServiceRecordsList } from "~/components/owner-service-records-list";
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
            href={`/vehicle/history?vehicleId=${vehicle.id}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to {vehicleName}
          </Link>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Edit Vehicle</h1>
            <p className="mt-1 text-muted-foreground">{vehicleName}</p>
          </div>
          <DeleteVehicleButton vehicleId={vehicle.id} vehicleName={vehicleName} />
        </div>

        {/* Section nav */}
        <div className="mt-6 flex flex-wrap gap-2">
          {[
            { href: "#details", label: "Details" },
            { href: "#service", label: `Service Records (${records.length})` },
            { href: "#maintenance", label: `Maintenance (${maintenanceItems.length})` },
            { href: "#community", label: `Community (${interactions?.comments.length ?? 0})` },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground hover:border-primary hover:text-primary"
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* ─── Vehicle Details ─── */}
      <section id="details" className="mb-12 scroll-mt-6">
        <h2 className="mb-4 text-2xl font-bold">Vehicle Details</h2>

        <div className="rounded-xl border border-border bg-card p-6">
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
                  className="mt-1 block w-full rounded-md border border-input px-3 py-2 focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
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
                  className="mt-1 block w-full rounded-md border border-input px-3 py-2 focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
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
                  className="mt-1 block w-full rounded-md border border-input px-3 py-2 focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="currentMileage" className="block text-sm font-medium">
                  Current Mileage
                </label>
                <input
                  type="number"
                  id="currentMileage"
                  name="currentMileage"
                  required
                  min="0"
                  defaultValue={vehicle.currentMileage}
                  className="mt-1 block w-full rounded-md border border-input px-3 py-2 focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                className="rounded bg-primary px-5 py-2 text-sm text-primary-foreground hover:bg-primary/90"
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
            className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            + Add Record
          </Link>
        </div>
        <OwnerServiceRecordsList records={records} />
      </section>

      {/* ─── Maintenance Schedule ─── */}
      <section id="maintenance" className="mb-12 scroll-mt-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Maintenance Schedule</h2>
          <Link
            href={`/vehicle/maintenance?vehicleId=${vehicle.id}`}
            className="rounded border border-input px-4 py-2 text-sm hover:bg-muted"
          >
            Edit Intervals
          </Link>
        </div>

        {maintenanceItems.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            No maintenance schedule.{" "}
            <Link
              href={`/vehicle/maintenance?vehicleId=${vehicle.id}`}
              className="text-primary underline"
            >
              Set one up
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Service</th>
                  <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Interval</th>
                  <th className="px-4 py-3 text-right font-medium">Next Due</th>
                  <th className="px-4 py-3 text-center font-medium">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {maintenanceItems.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{item.title}</td>
                    <td className="hidden px-4 py-3 capitalize text-muted-foreground sm:table-cell">
                      {item.category.replace("_", " ")}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {[
                        item.intervalMiles
                          ? `${item.intervalMiles.toLocaleString()} mi`
                          : null,
                        item.intervalMonths ? `${item.intervalMonths} mo` : null,
                      ]
                        .filter(Boolean)
                        .join(" / ")}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {item.nextDueMileage
                        ? `${item.nextDueMileage.toLocaleString()} mi`
                        : "—"}
                      {item.nextDueDate && (
                        <div className="text-xs">
                          {new Date(item.nextDueDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${
                          item.isActive ? "bg-green-500" : "bg-muted-foreground"
                        }`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ─── Community ─── */}
      <section id="community" className="mb-12 scroll-mt-6">
        <h2 className="mb-4 text-2xl font-bold">Community</h2>

        <div className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-3">
          <span className="text-sm text-muted-foreground">Likes</span>
          <span className="text-lg font-semibold">{interactions?.likeCount ?? 0}</span>
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
