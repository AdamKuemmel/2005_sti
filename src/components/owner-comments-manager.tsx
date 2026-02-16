"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteCommentAsOwner } from "~/server/actions/interactions";

interface Comment {
  id: number;
  body: string;
  createdAt: Date;
  userId: string;
  user: { name: string | null; image: string | null };
}

interface OwnerCommentsManagerProps {
  vehicleId: number;
  initialComments: Comment[];
  currentUserId: string;
}

export function OwnerCommentsManager({
  vehicleId,
  initialComments,
  currentUserId,
}: OwnerCommentsManagerProps) {
  const [comments, setComments] = useState(initialComments);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (commentId: number) => {
    if (!confirm("Delete this comment?")) return;
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    startTransition(async () => {
      await deleteCommentAsOwner(commentId, vehicleId);
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 font-semibold">
        {comments.length} Comment{comments.length !== 1 ? "s" : ""}
      </h3>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              {comment.user.image ? (
                <Image
                  src={comment.user.image}
                  alt={comment.user.name ?? "User"}
                  width={32}
                  height={32}
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {comment.user.name?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">
                    {comment.user.name ?? "Anonymous"}
                  </span>
                  {comment.userId === currentUserId && (
                    <span className="text-xs text-muted-foreground">(you)</span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-0.5 text-sm">{comment.body}</p>
              </div>
              <button
                onClick={() => handleDelete(comment.id)}
                disabled={isPending}
                className="shrink-0 rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                aria-label="Delete comment"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
