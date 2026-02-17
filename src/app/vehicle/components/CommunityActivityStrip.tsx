import Link from "next/link";
import { Heart, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import type { getNotifications } from "~/server/actions/notifications";

type Notification = Awaited<ReturnType<typeof getNotifications>>[number];

interface CommunityActivityStripProps {
  notifications: Notification[];
}

function relativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function CommunityActivityStrip({ notifications }: CommunityActivityStripProps) {
  const recent = notifications.slice(0, 8);

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-2xl font-bold">Community Activity</h2>
      {recent.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No recent activity on your vehicles yet.
        </p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {recent.map((n) => {
            const actorName = n.actor?.name ?? "Someone";
            const actorImage = n.actor?.image ?? undefined;
            const initials = actorName
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            const vehicleLabel = n.vehicle
              ? `${n.vehicle.year} ${n.vehicle.make} ${n.vehicle.model}`
              : "your vehicle";
            const action = n.type === "like" ? "liked" : "commented on";

            return (
              <Link
                key={n.id}
                href={`/vehicle/history?vehicleId=${n.vehicleId}`}
                className="bg-card border-border hover:border-primary flex min-w-[220px] shrink-0 flex-col gap-2 rounded-xl border p-4 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <Avatar className="size-7">
                    <AvatarImage src={actorImage} alt={actorName} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  {n.type === "like" ? (
                    <Heart className="text-destructive size-4" />
                  ) : (
                    <MessageSquare className="text-primary size-4" />
                  )}
                </div>
                <p className="text-sm leading-snug">
                  <span className="font-medium">{actorName}</span>{" "}
                  <span className="text-muted-foreground">{action} your</span>{" "}
                  <span className="font-medium">{vehicleLabel}</span>
                </p>
                <p className="text-muted-foreground text-xs">
                  {relativeTime(new Date(n.createdAt))}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
