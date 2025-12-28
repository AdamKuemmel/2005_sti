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
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">
          No upcoming maintenance scheduled. All caught up! 🎉
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "overdue":
        return (
          <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
            Overdue
          </span>
        );
      case "due-soon":
        return (
          <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
            Due Soon
          </span>
        );
      case "upcoming":
        return (
          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
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
    <div className="rounded-lg border border-gray-200 bg-white">
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
              <TableCell className="text-sm text-gray-600">
                {item.category.replace("_", " ")}
              </TableCell>
              <TableCell className="text-sm">{formatDueInfo(item)}</TableCell>
              <TableCell className="text-right text-sm">
                <div>
                  {item.nextDueMileage && (
                    <div>{item.nextDueMileage.toLocaleString()} mi</div>
                  )}
                  {item.nextDueDate && (
                    <div className="text-gray-500">
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
