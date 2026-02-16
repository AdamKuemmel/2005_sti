import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";

interface Vehicle {
  id: number;
  year: number;
  make: string;
  model: string;
  currentMileage: number;
  lastMileageUpdate: Date;
}

interface Owner {
  name: string | null;
  image: string | null;
}

interface HistoryHeaderProps {
  vehicle: Vehicle;
  isOwner: boolean;
  owner: Owner | null;
}

export function HistoryHeader({ vehicle, isOwner, owner }: HistoryHeaderProps) {
  return (
    <div className="mb-8">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: title + meta */}
        <div>
          <h1 className="text-3xl font-bold">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h1>
          <p className="mt-1 text-xl text-muted-foreground">
            {vehicle.currentMileage.toLocaleString()} miles
          </p>
          {owner && (
            <div className="mt-2 flex items-center gap-2">
              {owner.image ? (
                <Image
                  src={owner.image}
                  alt={owner.name ?? "Owner"}
                  width={22}
                  height={22}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {(owner.name ?? "?")[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-sm text-muted-foreground">{owner.name ?? "Unknown"}</span>
            </div>
          )}
        </div>

        {/* Right: owner actions */}
        {isOwner && (
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/vehicle/edit?vehicleId=${vehicle.id}`}>Edit</Link>
            </Button>
            <Button asChild>
              <Link href="/vehicle/service/add">Add Record</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
