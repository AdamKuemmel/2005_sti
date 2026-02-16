import { db } from "~/server/db";
import { HeroSection } from "~/components/hero-section";
import { FeaturedCarsSection } from "~/components/featured-cars-section";
import { auth } from "~/server/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const featuredVehicles = await db.query.vehicle.findMany({
    limit: 6,
    with: {
      photos: true,
    },
  });

  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturedCarsSection
        vehicles={featuredVehicles}
        currentUserId={session?.user?.id}
      />
    </main>
  );
}
