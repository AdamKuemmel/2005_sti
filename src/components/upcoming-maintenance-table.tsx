import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

interface UpcomingMaintenanceItem {
  id: number;
  title: string;
  category: string;
  intervalMiles: number | null;
  intervalMonths: number | null;
  nextDueMileage: number | null;
  nextDueDate: string | null;
  dueStatus: "overdue" | "due-soon" | "upcoming" | "ok";
  daysUntilDue: number | null;
  milesUntilDue: number | null;
}

interface UpcomingMaintenanceTableProps {
  items: UpcomingMaintenanceItem[];
  currentMileage?: number;
}

export function UpcomingMaintenanceTable({
  items,
}: UpcomingMaintenanceTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          No upcoming maintenance scheduled. All caught up! 🎉
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "overdue":
        return (
          <span className="rounded-full bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive">
            Overdue
          </span>
        );
      case "due-soon":
        return (
          <span className="rounded-full bg-accent/50 px-2 py-1 text-xs font-semibold text-accent-foreground">
            Due Soon
          </span>
        );
      case "upcoming":
        return (
          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
            Upcoming
          </span>
        );
      default:
        return null;
    }
  };

  const formatDueInfo = (item: UpcomingMaintenanceItem) => {
    const parts = [];

    if (item.milesUntilDue !== null) {
      if (item.milesUntilDue <= 0) {
        parts.push(
          `${Math.abs(item.milesUntilDue).toLocaleString()} miles overdue`,
        );
      } else {
        parts.push(`${item.milesUntilDue.toLocaleString()} miles`);
      }
    }

    if (item.daysUntilDue !== null) {
      if (item.daysUntilDue <= 0) {
        parts.push(`${Math.abs(item.daysUntilDue)} days overdue`);
      } else {
        parts.push(`${item.daysUntilDue} days`);
      }
    }

    return parts.join(" or ");
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Due In</TableHead>
            <TableHead className="text-right">Next Due</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{getStatusBadge(item.dueStatus)}</TableCell>
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {item.category.replace("_", " ")}
              </TableCell>
              <TableCell className="text-sm">{formatDueInfo(item)}</TableCell>
              <TableCell className="text-right text-sm">
                <div>
                  {item.nextDueMileage && (
                    <div>{item.nextDueMileage.toLocaleString()} mi</div>
                  )}
                  {item.nextDueDate && (
                    <div className="text-muted-foreground">
                      {new Date(item.nextDueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
