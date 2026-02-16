import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { getServiceRecord } from "~/server/actions/service-records";
import { getVehicle } from "~/server/actions/vehicles";
import { EditServiceForm } from "~/components/edit-service-form";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const { id } = await params;
  const recordId = parseInt(id);

  const record = await getServiceRecord(recordId);
  if (!record) redirect("/vehicle/history");

  if (record.createdById !== session.user.id) redirect("/vehicle/history");

  const vehicle = await getVehicle(record.vehicleId);
  if (!vehicle) redirect("/vehicle/history");

  const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  return (
    <div className="container mx-auto p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link
            href={`/vehicle/history?vehicleId=${vehicle.id}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to {vehicleName}
          </Link>
        </div>
        <h1 className="mb-2 text-3xl font-bold">Edit Service Record</h1>
        <p className="mb-8 text-muted-foreground">{vehicleName}</p>
        <EditServiceForm record={record} vehicle={vehicle} />
      </div>
    </div>
  );
}
