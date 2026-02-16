"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { vehicleComments, vehicleLikes } from "~/server/db/schema";

export async function toggleLike(vehicleId: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const userId = session.user.id;

  const existing = await db
    .select()
    .from(vehicleLikes)
    .where(and(eq(vehicleLikes.vehicleId, vehicleId), eq(vehicleLikes.userId, userId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .delete(vehicleLikes)
      .where(and(eq(vehicleLikes.vehicleId, vehicleId), eq(vehicleLikes.userId, userId)));
  } else {
    await db.insert(vehicleLikes).values({ vehicleId, userId });
  }

  revalidatePath("/vehicle/history");
}

export async function getVehicleInteractions(vehicleId: number) {
  const session = await auth();

  const [likeCountResult, comments] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(vehicleLikes)
      .where(eq(vehicleLikes.vehicleId, vehicleId)),
    db.query.vehicleComments.findMany({
      where: (c, { eq }) => eq(c.vehicleId, vehicleId),
      with: { user: { columns: { name: true, image: true } } },
      orderBy: (c, { desc }) => [desc(c.createdAt)],
    }),
  ]);

  let hasLiked = false;
  if (session?.user?.id) {
    const userLike = await db
      .select()
      .from(vehicleLikes)
      .where(and(eq(vehicleLikes.vehicleId, vehicleId), eq(vehicleLikes.userId, session.user.id)))
      .limit(1);
    hasLiked = userLike.length > 0;
  }

  return {
    likeCount: Number(likeCountResult[0]?.count ?? 0),
    hasLiked,
    comments,
  };
}

export async function addComment(vehicleId: number, body: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const trimmed = body.trim();
  if (!trimmed) return;

  await db.insert(vehicleComments).values({
    vehicleId,
    userId: session.user.id,
    body: trimmed,
  });

  revalidatePath("/vehicle/history");
}

export async function deleteComment(commentId: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  await db
    .delete(vehicleComments)
    .where(
      and(
        eq(vehicleComments.id, commentId),
        eq(vehicleComments.userId, session.user.id),
      ),
    );

  revalidatePath("/vehicle/history");
}
