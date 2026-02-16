import Link from "next/link";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import VehicleCard from "~/app/vehicle/_components/VehicleCard";
import { vehicle, vehiclePhotos } from "~/server/db/schema";
type Vehicle = typeof vehicle.$inferSelect;
type VehiclePhoto = typeof vehiclePhotos.$inferSelect;
type VehicleWithPhotos = Vehicle & { photos: VehiclePhoto[] };

export function FeaturedCarsSection({
  vehicles,
}: {
  vehicles: VehicleWithPhotos[];
}) {
  if (vehicles.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-100 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900">
            Featured Vehicles
          </h2>
          <p className="mt-2 text-gray-500">
            Community builds with documented histories
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      </div>
    </section>
  );
}
