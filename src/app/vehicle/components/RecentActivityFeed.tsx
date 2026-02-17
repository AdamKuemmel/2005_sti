import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { getRecentActivityFeed } from "~/server/actions/garage-stats";

type ActivityFeedItems = Awaited<ReturnType<typeof getRecentActivityFeed>>;

interface RecentActivityFeedProps {
  items: ActivityFeedItems;
}

const CATEGORY_DOTS: Record<string, string> = {
  fluid: "bg-blue-500",
  engine_drivetrain: "bg-amber-500",
  consumable: "bg-green-500",
  inspection: "bg-purple-500",
  other: "bg-muted-foreground",
};

export function RecentActivityFeed({ items }: RecentActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest service across your garage</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            No service records yet. Log your first service to get started.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => {
              const dotColor = CATEGORY_DOTS[item.category] ?? CATEGORY_DOTS.other!;
              const formattedDate = new Date(item.serviceDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              return (
                <Link
                  key={item.id}
                  href={`/vehicle/history?vehicleId=${item.vehicle.id}`}
                  className="flex items-center gap-3 py-3 transition-colors hover:bg-muted/50 -mx-2 px-2 rounded"
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {item.vehicle.year} {item.vehicle.make} {item.vehicle.model} · {formattedDate}
                    </p>
                  </div>
                  {item.totalCost && (
                    <span className="shrink-0 text-sm font-medium text-primary">
                      ${parseFloat(item.totalCost).toFixed(2)}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
      {items.length > 0 && (
        <CardFooter>
          <Link
            href="/vehicle/history"
            className="text-primary text-sm hover:underline"
          >
            View all history →
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
