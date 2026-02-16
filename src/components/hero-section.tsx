import Link from "next/link";
import { Button } from "./ui/button";
import { WrenchIcon } from "lucide-react";

export function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center bg-linear-to-b from-gray-900 to-gray-800 px-6 py-28 text-center text-white">
      <p className="mb-4 text-sm font-semibold tracking-widest text-indigo-400 uppercase">
        Car Maintenance, Simplified
      </p>
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
        Track. Maintain. <span className="text-indigo-400">Share.</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-gray-300">
        Your car&apos;s complete service history in one place. Log every oil
        change, track upcoming maintenance intervals, and share your build with
        a community that cares about the details.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href="/vehicle">
          <Button variant="outline" size="sm" className="w-full">
            <WrenchIcon className="size-4" /> Garage
          </Button>
        </Link>
        <Link
          href="/vehicle/add"
          className="rounded-lg border border-white/30 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
        >
          Add Your Car
        </Link>
      </div>
      <div className="mt-16 grid gap-10 text-center md:grid-cols-3">
        <div>
          <p className="text-3xl font-bold text-white">Full History</p>
          <p className="mt-1 text-sm text-gray-400">
            Every service, documented
          </p>
        </div>
        <div>
          <p className="text-3xl font-bold text-white">Smart Reminders</p>
          <p className="mt-1 text-sm text-gray-400">Never miss an interval</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-white">Community</p>
          <p className="mt-1 text-sm text-gray-400">Share your build</p>
        </div>
      </div>
    </section>
  );
}
