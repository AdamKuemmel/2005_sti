import { auth } from "~/server/auth";
import { getAllVehicles, getPublicVehicles } from "~/server/actions/vehicles";

import Link from "next/link";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Button } from "~/components/ui/button";
import { WrenchIcon } from "lucide-react";
import VehicleCard from "./_components/VehicleCard";
import { FeaturedCarsSection } from "~/components/featured-cars-section";

export default async function VehiclesPage() {
  const session = await auth();

  if (session) {
    const [vehicles, allVehicles] = await Promise.all([
      getAllVehicles(session.user.id),
      getPublicVehicles(),
    ]);

    return (
      <div className="container mx-auto p-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">My Garage</h1>
            <Link
              href="/vehicle/add"
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Add Vehicle
            </Link>
          </div>

          {vehicles.length === 0 ? (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <WrenchIcon className="size-8 text-gray-400" />
                </EmptyMedia>
                <EmptyTitle>Your Garage is Empty</EmptyTitle>
                <EmptyDescription>
                  Start by adding your first vehicle to track its history and
                  maintenance.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" size="sm">
                  Add Your First Vehicle
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {vehicles.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} />
                ))}
              </div>
            </div>
          )}
        </div>
        {allVehicles.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <WrenchIcon className="size-8 text-gray-400" />
              </EmptyMedia>
              <EmptyTitle>No Vehicles Found</EmptyTitle>
              <EmptyDescription>
                No vehicles have been added yet. Please check back later.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="pt-4">
            <FeaturedCarsSection vehicles={allVehicles} />
          </div>
        )}
      </div>
    );
  }

  // Guest view — all vehicles, read-only
  const allVehicles = await getPublicVehicles();

  return (
    <div className="container mx-auto p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Vehicles</h1>
        </div>

        {allVehicles.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <WrenchIcon className="size-8 text-gray-400" />
              </EmptyMedia>
              <EmptyTitle>No Vehicles Found</EmptyTitle>
              <EmptyDescription>
                No vehicles have been added yet. Please check back later.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <FeaturedCarsSection vehicles={allVehicles} />
        )}
      </div>
    </div>
  );
}
