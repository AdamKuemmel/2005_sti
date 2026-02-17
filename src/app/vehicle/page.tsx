import { auth } from "~/server/auth";
import { getAllVehicles, getPublicVehicles } from "~/server/actions/vehicles";
import {
  getGarageStats,
  getMaintenanceAlertsAcrossVehicles,
  getRecentActivityFeed,
} from "~/server/actions/garage-stats";
import { getNotifications } from "~/server/actions/notifications";
import Link from "next/link";
import { WrenchIcon } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Button } from "~/components/ui/button";
import VehicleCard from "./components/VehicleCard";
import { FeaturedCarsSection } from "~/components/featured-cars-section";
import { QuickActionsBar } from "./components/QuickActionsBar";
import { GarageStatCards } from "./components/GarageStatCards";
import { MaintenanceAlertWidget } from "./components/MaintenanceAlertWidget";
import { RecentActivityFeed } from "./components/RecentActivityFeed";
import { CommunityActivityStrip } from "./components/CommunityActivityStrip";

export default async function VehiclesPage() {
  const session = await auth();

  if (session) {
    const [vehicles, allVehicles, stats, maintenanceAlerts, activityFeed, notifications] =
      await Promise.all([
        getAllVehicles(session.user.id),
        getPublicVehicles(),
        getGarageStats(session.user.id),
        getMaintenanceAlertsAcrossVehicles(session.user.id),
        getRecentActivityFeed(session.user.id, 5),
        getNotifications(),
      ]);

    // Derive per-vehicle health status from alerts data (no extra queries)
    const healthStatusMap = new Map<number, "overdue" | "due-soon">();
    for (const entry of maintenanceAlerts) {
      const hasOverdue = entry.alerts.some((a) => a.dueStatus === "overdue");
      const hasDueSoon = entry.alerts.some((a) => a.dueStatus === "due-soon");
      if (hasOverdue) {
        healthStatusMap.set(entry.vehicle.id, "overdue");
      } else if (hasDueSoon) {
        healthStatusMap.set(entry.vehicle.id, "due-soon");
      }
    }

    return (
      <div className="container mx-auto px-4 py-6 sm:px-8 sm:py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold sm:text-3xl">My Garage</h1>
          <Link href="/vehicle/add">
            <Button>Add Vehicle</Button>
          </Link>
        </div>

        {/* Quick Actions */}
        <QuickActionsBar vehicles={vehicles} />

        {/* Stat Cards */}
        <GarageStatCards stats={stats} />

        {/* Maintenance Alerts + Recent Activity */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <MaintenanceAlertWidget entries={maintenanceAlerts} />
          <RecentActivityFeed items={activityFeed} />
        </div>

        {/* Your Vehicles */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold">Your Vehicles</h2>
          {vehicles.length === 0 ? (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <WrenchIcon className="text-muted-foreground size-8" />
                </EmptyMedia>
                <EmptyTitle>Your Garage is Empty</EmptyTitle>
                <EmptyDescription>
                  Start by adding your first vehicle to track its history and
                  maintenance.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/vehicle/add">Add Your First Vehicle</Link>
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((v) => (
                <VehicleCard
                  key={v.id}
                  vehicle={v}
                  isOwner={true}
                  healthStatus={healthStatusMap.get(v.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Community Activity */}
        <CommunityActivityStrip notifications={notifications} />

        {/* Featured / Community Vehicles */}
        {allVehicles.length > 0 && (
          <FeaturedCarsSection
            vehicles={allVehicles}
            currentUserId={session.user.id}
          />
        )}
      </div>
    );
  }

  // Guest view — all vehicles, read-only (unchanged)
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
                <WrenchIcon className="text-muted-foreground size-8" />
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
