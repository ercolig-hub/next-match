
"use client";

import { useState } from "react";
import { toast } from "sonner";

type LikeButtonProps = {
  userId: string;
};

export default function LikeButton({ userId }: LikeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);

  async function handleLike() {
    setLoading(true);

    try {
      const response = await fetch("/api/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toUserId: userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Errore durante il Like");
        return;
      }

      setLiked(true);
      toast.success("Hai messo Like! ❤️");
    } catch (error) {
      console.error(error);
      toast.error("Errore di connessione");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        onClick={handleLike}
        disabled={loading || liked}
        className="w-full rounded bg-pink-500 px-4 py-2 text-white disabled:opacity-50"
      >
        {loading
          ? "Invio..."
          : liked
          ? "❤️ Mi piace!"
          : "❤️ Mi piace"}
      </button>
    </div>
  );
}

