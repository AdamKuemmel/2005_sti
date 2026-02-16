import Image from "next/image";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { vehicle, vehiclePhotos } from "~/server/db/schema";

type Vehicle = typeof vehicle.$inferSelect;
type VehiclePhoto = typeof vehiclePhotos.$inferSelect;
type VehicleWithPhotos = Vehicle & { photos: VehiclePhoto[] };

export default function VehicleCard({
  vehicle,
}: {
  vehicle: VehicleWithPhotos;
}) {
  const primaryPhoto =
    vehicle.photos.find((p) => p.isPrimary) ?? vehicle.photos[0];
  const imageUrl = primaryPhoto?.fileUrl ?? "/placeholder-car.jpg";
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  return (
    <Link
      href={`/vehicle/history?vehicleId=${vehicle.id}`}
      className="group block"
    >
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
          <CardAction>
            <Badge variant="secondary">Featured</Badge>
          </CardAction>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {vehicle.currentMileage.toLocaleString()} miles
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full">View Build</Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
