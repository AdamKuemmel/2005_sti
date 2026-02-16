import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { WrenchIcon, PlusIcon } from "lucide-react";

const stats = [
  { label: "Full History", description: "Every service, documented" },
  { label: "Smart Reminders", description: "Never miss an interval" },
  { label: "Community", description: "Share your build" },
];

export function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center bg-linear-to-b from-background to-muted px-6 py-28 text-center">
      <Badge
        variant="outline"
        className="mb-4 border-primary/30 text-primary tracking-widest uppercase"
      >
        Car Maintenance, Simplified
      </Badge>

      <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
        Track. Maintain. <span className="text-primary">Share.</span>
      </h1>

      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Your car&apos;s complete service history in one place. Log every oil
        change, track upcoming maintenance intervals, and share your build with
        a community that cares about the details.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Button asChild size="lg">
          <Link href="/vehicle/add">
            <PlusIcon /> Add Your Car
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/vehicle">
            <WrenchIcon /> Garage
          </Link>
        </Button>
      </div>

      <Separator className="mt-16 max-w-xs opacity-40" />

      <div className="mt-10 grid w-full max-w-2xl gap-4 sm:grid-cols-3">
        {stats.map(({ label, description }) => (
          <Card key={label} className="gap-2 py-5">
            <CardContent className="flex flex-col gap-1 px-4">
              <CardTitle className="text-2xl font-bold">{label}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
