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
import { vehicle, vehiclePhotos } from "~/server/db/schema";

interface FeaturedVehicle {
  id: number;
  year: number;
  make: string;
  model: string;
  currentMileage: number;
  photos: VehiclePhoto[];
}

interface FeaturedCarsSectionProps {
  vehicles: FeaturedVehicle[];
}

const PLACEHOLDER_IMAGE =
  "https://placehold.co/600x400/1f2937/4b5563?text=No+Photo";

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
  const imageUrl = primaryPhoto?.fileUrl ?? PLACEHOLDER_IMAGE;
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  return (
    <Link
      href={`/vehicle/history?vehicleId=${vehicle.id}`}
      className="group block"
    >
      <Card className="h-fu relative w-full overflow-hidden pt-0 transition-shadow hover:shadow-md">
        <div className="absolute inset-0 z-10 aspect-video bg-black/30" />
        <img
          src={imageUrl}
          alt={title}
          className="relative z-0 aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
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
