"use server";

import { and, eq, inArray } from "drizzle-orm";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { notifications } from "~/server/db/schema";

export async function getNotifications() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.query.notifications.findMany({
    where: (n, { eq }) => eq(n.userId, session.user.id),
    with: {
      actor: { columns: { name: true, image: true } },
      vehicle: { columns: { id: true, year: true, make: true, model: true } },
    },
    orderBy: (n, { desc }) => [desc(n.createdAt)],
    limit: 20,
  });
}

export async function markNotificationsRead(ids: number[]) {
  const session = await auth();
  if (!session?.user?.id || ids.length === 0) return;

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.userId, session.user.id),
        inArray(notifications.id, ids),
      ),
    );
}
