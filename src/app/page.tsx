import { db } from "~/server/db";
import { HeroSection } from "~/components/hero-section";
import { FeaturedCarsSection } from "~/components/featured-cars-section";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredVehicles = await db.query.vehicle.findMany({
    limit: 6,
    with: {
      photos: true,
    },
  });

  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturedCarsSection vehicles={featuredVehicles} />
    </main>
  );
}
