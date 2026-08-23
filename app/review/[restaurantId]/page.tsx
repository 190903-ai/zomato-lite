"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ReviewPage() {
  const params = useParams<{ restaurantId: string }>();
  const router = useRouter();

  const [name, setName] = useState<string | null>(null);
  const [gone, setGone] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const res = await fetch(`/api/restaurants/${params.restaurantId}`);
      if (!res.ok) {
        if (active) setGone(true);
        return;
      }
      const body = (await res.json()) as { name: string };
      if (active) setName(body.name);
    }
    load();
    return () => {
      active = false;
    };
  }, [params.restaurantId]);

  const canSubmit =
    rating !== null && comment.trim().length > 0 && !submitting && name !== null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId: Number(params.restaurantId),
        rating,
        comment,
      }),
    });

    if (res.status === 201) {
      router.push(`/restaurant/${params.restaurantId}`);
      return;
    }

    const body = (await res.json()) as { error?: string };
    setError(body.error ?? "Something went wrong.");
    setSubmitting(false);
  }

  const shell =
    "mx-auto flex min-h-screen w-full max-w-[560px] flex-col px-5 py-14";

  if (gone) {
    return (
      <main className={shell}>
        <p className="text-sm text-[#8a857c]">Restaurant not found.</p>
      </main>
    );
  }

  return (
    <main className={shell}>
      <h1 className="text-2xl font-semibold tracking-tight">
        {name ?? "Loading…"}
      </h1>
      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-8">
        <div>
          <label className="text-xs font-medium uppercase tracking-widest text-[#8a857c]">
            Your rating
          </label>
          <div className="mt-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
                onClick={() => setRating(n)}
                className={`text-4xl leading-none transition-colors ${
                  rating !== null && n <= rating
                    ? "text-[#c2410c]"
                    : "text-[#ddd7cb] hover:text-[#b9b2a4]"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="comment"
            className="text-xs font-medium uppercase tracking-widest text-[#8a857c]"
          >
            Your review
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you think?"
            className="mt-3 w-full resize-none rounded-lg border border-[#e7e2da] bg-white p-4 text-[15px] leading-relaxed focus:border-[#c2410c] focus:outline-none"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-[#f0d9d6] bg-[#fbf1f0] p-4 text-sm text-[#b3261e]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-lg bg-[#c2410c] py-3.5 text-[15px] font-medium text-white hover:bg-[#a93a0b] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "Submitting…" : "Submit review"}
        </button>
      </form>
    </main>
  );
}
