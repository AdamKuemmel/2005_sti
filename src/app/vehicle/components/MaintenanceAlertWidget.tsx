import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { getMaintenanceAlertsAcrossVehicles } from "~/server/actions/garage-stats";

type AlertEntries = Awaited<ReturnType<typeof getMaintenanceAlertsAcrossVehicles>>;

interface MaintenanceAlertWidgetProps {
  entries: AlertEntries;
}

function formatDueInfo(milesUntilDue: number | null, daysUntilDue: number | null): string {
  const parts: string[] = [];
  if (milesUntilDue !== null) {
    if (milesUntilDue <= 0) {
      parts.push(`${Math.abs(milesUntilDue).toLocaleString()} mi overdue`);
    } else {
      parts.push(`${milesUntilDue.toLocaleString()} mi`);
    }
  }
  if (daysUntilDue !== null) {
    if (daysUntilDue <= 0) {
      parts.push(`${Math.abs(daysUntilDue)}d overdue`);
    } else {
      parts.push(`${daysUntilDue}d`);
    }
  }
  return parts.join(" · ");
}

export function MaintenanceAlertWidget({ entries }: MaintenanceAlertWidgetProps) {
  const actionableEntries = entries.map((entry) => ({
    ...entry,
    alerts: entry.alerts.filter(
      (a) => a.dueStatus === "overdue" || a.dueStatus === "due-soon",
    ),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Alerts</CardTitle>
        <CardDescription>Items needing attention across your garage</CardDescription>
      </CardHeader>
      <CardContent>
        {actionableEntries.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            All caught up! No overdue or due-soon items.
          </p>
        ) : (
          <div className="space-y-5">
            {actionableEntries.map((entry) => (
              <div key={entry.vehicle.id}>
                <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
                  {entry.vehicle.year} {entry.vehicle.make} {entry.vehicle.model}
                </p>
                <div className="space-y-2">
                  {entry.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                    >
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                          alert.dueStatus === "overdue"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                        }`}
                      >
                        {alert.dueStatus === "overdue" ? "Overdue" : "Due Soon"}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {alert.title}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDueInfo(alert.milesUntilDue, alert.daysUntilDue)}
                      </span>
                      <Link
                        href="/vehicle/service/add"
                        className="shrink-0 text-xs text-primary hover:underline"
                      >
                        Log Service
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
