import { AlertTriangle, Car, DollarSign, Wrench } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";

interface GarageStatCardsProps {
  stats: {
    vehicleCount: number;
    totalSpend: number;
    openMaintenanceCount: number;
    totalServiceRecords: number;
  };
}

export function GarageStatCards({ stats }: GarageStatCardsProps) {
  const cards = [
    {
      label: "Vehicles",
      value: stats.vehicleCount.toString(),
      description: "in garage",
      icon: Car,
      valueClass: "",
    },
    {
      label: "Total Spend",
      value: `$${stats.totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: "across all records",
      icon: DollarSign,
      valueClass: "",
    },
    {
      label: "Open Alerts",
      value: stats.openMaintenanceCount.toString(),
      description: "overdue or due soon",
      icon: AlertTriangle,
      valueClass: stats.openMaintenanceCount === 0 ? "text-green-600 dark:text-green-400" : "text-destructive",
    },
    {
      label: "Service Records",
      value: stats.totalServiceRecords.toString(),
      description: "logged",
      icon: Wrench,
      valueClass: "",
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader>
            <CardDescription>{card.label}</CardDescription>
            <CardAction>
              <card.icon className="text-muted-foreground size-4" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <CardTitle className={`text-3xl font-bold ${card.valueClass}`}>
              {card.value}
            </CardTitle>
            <p className="text-muted-foreground mt-1 text-xs">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
