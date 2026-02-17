import Image from "next/image";
import Link from "next/link";
import { LikeButton } from "~/components/like-button";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { getVehicleInteractions } from "~/server/actions/interactions";
import { auth } from "~/server/auth";
import { cn } from "~/lib/utils";
import type { vehicle, vehiclePhotos } from "~/server/db/schema";

type Vehicle = typeof vehicle.$inferSelect;
type VehiclePhoto = typeof vehiclePhotos.$inferSelect;
type VehicleWithPhotos = Vehicle & { photos: VehiclePhoto[] };

export default async function VehicleCard({
  vehicle,
  isOwner = false,
  healthStatus,
}: {
  vehicle: VehicleWithPhotos;
  isOwner?: boolean;
  healthStatus?: "overdue" | "due-soon";
}) {
  const session = await auth();
  const interactions = await getVehicleInteractions(vehicle.id);

  const primaryPhoto =
    vehicle.photos.find((p) => p.isPrimary) ?? vehicle.photos[0];
  const imageUrl = primaryPhoto?.fileUrl ?? "/placeholder-car.jpg";
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const href = isOwner
    ? `/vehicle/edit?vehicleId=${vehicle.id}`
    : `/vehicle/history?vehicleId=${vehicle.id}`;

  return (
    <Card className="h-fu relative w-full overflow-hidden pt-0 transition-shadow hover:shadow-md">
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 z-10 bg-black/30" />
        {healthStatus && (
          <div className="absolute right-2 top-2 z-20">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white",
                healthStatus === "overdue" ? "bg-destructive/90" : "bg-amber-500/90",
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {healthStatus === "overdue" ? "Overdue" : "Due Soon"}
            </span>
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {vehicle.currentMileage.toLocaleString()} miles
        </CardDescription>
        <CardAction>
          <LikeButton
            vehicleId={vehicle.id}
            initialCount={interactions.likeCount}
            initialHasLiked={interactions.hasLiked}
            isLoggedIn={!!session}
          />
        </CardAction>
      </CardHeader>
      <CardFooter>
        <Link href={href} className="">
          <Button className="w-full">
            {isOwner ? "Edit Vehicle" : "View Build"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
