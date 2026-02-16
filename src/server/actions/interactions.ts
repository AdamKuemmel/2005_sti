"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { vehicleComments, vehicleLikes, vehicle, notifications } from "~/server/db/schema";

export async function toggleLike(vehicleId: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const userId = session.user.id;

  const [existing, vehicleData] = await Promise.all([
    db
      .select()
      .from(vehicleLikes)
      .where(and(eq(vehicleLikes.vehicleId, vehicleId), eq(vehicleLikes.userId, userId)))
      .limit(1),
    db.select({ ownerId: vehicle.ownerId }).from(vehicle).where(eq(vehicle.id, vehicleId)).limit(1),
  ]);

  const ownerId = vehicleData[0]?.ownerId;

  if (existing.length > 0) {
    // Unlike: remove like and any corresponding notification
    await Promise.all([
      db
        .delete(vehicleLikes)
        .where(and(eq(vehicleLikes.vehicleId, vehicleId), eq(vehicleLikes.userId, userId))),
      ownerId && ownerId !== userId
        ? db
            .delete(notifications)
            .where(
              and(
                eq(notifications.vehicleId, vehicleId),
                eq(notifications.actorId, userId),
                eq(notifications.userId, ownerId),
                eq(notifications.type, "like"),
              ),
            )
        : Promise.resolve(),
    ]);
  } else {
    // Like: insert like and notify owner (don't notify yourself)
    await db.insert(vehicleLikes).values({ vehicleId, userId });
    if (ownerId && ownerId !== userId) {
      await db.insert(notifications).values({ userId: ownerId, actorId: userId, type: "like", vehicleId });
    }
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

  const userId = session.user.id;
  const trimmed = body.trim();
  if (!trimmed) return;

  const [vehicleData] = await db
    .select({ ownerId: vehicle.ownerId })
    .from(vehicle)
    .where(eq(vehicle.id, vehicleId))
    .limit(1);

  await db.insert(vehicleComments).values({ vehicleId, userId, body: trimmed });

  // Notify owner if commenter is not the owner
  if (vehicleData?.ownerId && vehicleData.ownerId !== userId) {
    await db.insert(notifications).values({
      userId: vehicleData.ownerId,
      actorId: userId,
      type: "comment",
      vehicleId,
    });
  }

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

export async function deleteCommentAsOwner(commentId: number, vehicleId: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const [ownedVehicle] = await db
    .select()
    .from(vehicle)
    .where(and(eq(vehicle.id, vehicleId), eq(vehicle.ownerId, session.user.id)));

  if (!ownedVehicle) throw new Error("Unauthorized");

  await db.delete(vehicleComments).where(eq(vehicleComments.id, commentId));

  revalidatePath("/vehicle/history");
  revalidatePath("/vehicle/edit");
}
