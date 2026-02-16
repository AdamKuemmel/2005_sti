"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleLike } from "~/server/actions/interactions";
import { Button } from "~/components/ui/button";

interface LikeButtonProps {
  vehicleId: number;
  initialCount: number;
  initialHasLiked: boolean;
  isLoggedIn: boolean;
}

export function LikeButton({
  vehicleId,
  initialCount,
  initialHasLiked,
  isLoggedIn,
}: LikeButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    // Optimistic update
    setCount((prev) => (hasLiked ? prev - 1 : prev + 1));
    setHasLiked((prev) => !prev);

    startTransition(async () => {
      await toggleLike(vehicleId);
    });
  };

  return (
    <Button
      variant={hasLiked ? "default" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={!isLoggedIn || isPending}
      title={isLoggedIn ? undefined : "Sign in to like"}
      className="flex items-center gap-1.5"
    >
      <Heart className={hasLiked ? "fill-current" : ""} />
      <span>{count}</span>
    </Button>
  );
}
