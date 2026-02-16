"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { getNotifications, markNotificationsRead } from "~/server/actions/notifications";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

type Notification = Awaited<ReturnType<typeof getNotifications>>[number];

const POLL_INTERVAL_MS = 30_000;

function relativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationBell() {
  const { data: session } = useSession();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const fetchNotifs = useCallback(async () => {
    const data = await getNotifications();
    setNotifs(data);
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    void fetchNotifs();
    const interval = setInterval(() => void fetchNotifs(), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [session?.user?.id, fetchNotifs]);

  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      const unreadIds = notifs.filter((n) => !n.isRead).map((n) => n.id);
      if (unreadIds.length > 0) {
        await markNotificationsRead(unreadIds);
        setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    }
  };

  if (!session?.user?.id) return null;

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifs.length === 0 ? (
          <div className="text-muted-foreground px-4 py-6 text-center text-sm">
            No notifications yet
          </div>
        ) : (
          notifs.map((n) => (
            <DropdownMenuItem key={n.id} asChild className="cursor-pointer">
              <Link
                href={`/vehicle/history?vehicleId=${n.vehicleId}`}
                className="flex items-start gap-3 px-3 py-2.5"
              >
                <Avatar className="mt-0.5 h-7 w-7 shrink-0">
                  <AvatarImage src={n.actor?.image ?? undefined} alt={n.actor?.name ?? ""} />
                  <AvatarFallback className="text-xs">
                    {n.actor?.name?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">
                    <span className="font-medium">{n.actor?.name ?? "Someone"}</span>
                    {n.type === "like" ? " liked" : " commented on"} your{" "}
                    <span className="font-medium">
                      {n.vehicle?.year} {n.vehicle?.make} {n.vehicle?.model}
                    </span>
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {relativeTime(new Date(n.createdAt))}
                  </p>
                </div>
                {!n.isRead && (
                  <span className="bg-primary mt-1.5 h-2 w-2 shrink-0 rounded-full" />
                )}
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
