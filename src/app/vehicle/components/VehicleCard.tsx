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
import { getUpcomingMaintenance } from "~/server/actions/maintenance";
import { getServiceRecords } from "~/server/actions/service-records";
import { getVehiclePhotos, getVehicleOwner } from "~/server/actions/vehicles";
import { auth } from "~/server/auth";
import type { vehicle, vehiclePhotos } from "~/server/db/schema";

type Vehicle = typeof vehicle.$inferSelect;
type VehiclePhoto = typeof vehiclePhotos.$inferSelect;
type VehicleWithPhotos = Vehicle & { photos: VehiclePhoto[] };

export default async function VehicleCard({
  vehicle,
  isOwner = false,
}: {
  vehicle: VehicleWithPhotos;
  isOwner?: boolean;
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
