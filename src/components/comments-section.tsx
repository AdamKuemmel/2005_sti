"use client";

import Image from "next/image";
import { useState, useTransition, useRef } from "react";
import { Trash2 } from "lucide-react";
import { addComment, deleteComment } from "~/server/actions/interactions";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

interface Comment {
  id: number;
  body: string;
  createdAt: Date;
  userId: string;
  user: { name: string | null; image: string | null };
}

interface CommentsSectionProps {
  vehicleId: number;
  initialComments: Comment[];
  currentUserId?: string;
}

export function CommentsSection({
  vehicleId,
  initialComments,
  currentUserId,
}: CommentsSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = formData.get("body") as string;
    if (!body?.trim()) return;

    // Optimistic add
    setComments((prev) => [
      {
        id: -Date.now(), // temp id
        body: body.trim(),
        createdAt: new Date(),
        userId: currentUserId!,
        user: { name: "You", image: null },
      },
      ...prev,
    ]);
    formRef.current?.reset();

    startTransition(async () => {
      await addComment(vehicleId, body);
    });
  };

  const handleDelete = (commentId: number) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    startTransition(async () => {
      await deleteComment(commentId);
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Comments</h2>

      {currentUserId && (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            name="body"
            placeholder="Leave a comment..."
            rows={2}
            required
          />
          <Button type="submit" size="sm" disabled={isPending}>
            Post
          </Button>
        </form>
      )}

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
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-0.5 text-sm">{comment.body}</p>
              </div>
              {currentUserId === comment.userId && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleDelete(comment.id)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
