"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";

export default function ReviewPage() {
  const params = useParams<{ restaurantId: string }>();
  const router = useRouter();

  const [name, setName] = useState<string | null>(null);
  const [area, setArea] = useState("");
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
      const body = (await res.json()) as { name: string; area: string };
      if (active) {
        setName(body.name);
        setArea(body.area);
      }
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

  function shell(inner: React.ReactNode) {
    return (
      <main className="min-h-screen">
        <TopBar />
        <div className="mx-auto w-full max-w-[560px] px-5 py-10">{inner}</div>
      </main>
    );
  }

  if (gone) {
    return shell(<p className="text-sm text-[#8a857c]">Restaurant not found.</p>);
  }

  return shell(
    <>
      <h1 className="text-[22px] font-semibold leading-tight tracking-tight">
        {name ?? "Loading…"}
      </h1>
      {area && <p className="mt-1 text-sm text-[#8a857c]">{area}</p>}

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-7 rounded-2xl border border-[#e7e2da] bg-white p-6"
      >
        <div>
          <div className="flex items-baseline justify-between">
            <label className="text-xs font-medium uppercase tracking-widest text-[#8a857c]">
              Your rating
            </label>
            {rating !== null && (
              <span className="text-xs text-[#8a857c]">{rating} / 5</span>
            )}
          </div>
          <div className="mt-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
                onClick={() => setRating(n)}
                className={`text-5xl leading-none transition-colors ${
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
            className="mt-3 w-full resize-none rounded-xl border border-[#e7e2da] bg-[#fdfbf8] p-4 text-[15px] leading-relaxed focus:border-[#c2410c] focus:outline-none"
          />
        </div>

        {error && (
          <p className="rounded-xl border border-[#f0d9d6] bg-[#fbf1f0] p-4 text-sm text-[#b3261e]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-xl bg-[#c2410c] py-3.5 text-[15px] font-medium text-white hover:bg-[#a93a0b] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "Submitting…" : "Submit review"}
        </button>
      </form>

      <Link
        href={`/restaurant/${params.restaurantId}`}
        className="mt-5 block text-center text-sm text-[#8a857c] hover:text-[#1a1815]"
      >
        Back to restaurant
      </Link>
    </>
  );
}
