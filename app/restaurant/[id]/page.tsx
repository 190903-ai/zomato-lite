"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
}

interface RestaurantData {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
}

function Stars({ value }: { value: number }) {
  return (
    <span className="text-[15px] tracking-[2px]">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= value ? "text-[#c2410c]" : "text-[#ddd7cb]"}>
          ★
        </span>
      ))}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function RestaurantPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<RestaurantData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const res = await fetch(`/api/restaurants/${params.id}`);
      if (!res.ok) {
        if (active) setFailed(true);
        return;
      }
      const body = (await res.json()) as RestaurantData;
      if (active) setData(body);
    }
    load();
    return () => {
      active = false;
    };
  }, [params.id]);

  const shell =
    "mx-auto flex min-h-screen w-full max-w-[560px] flex-col px-5 py-14";

  if (failed) {
    return (
      <main className={shell}>
        <p className="text-sm text-[#8a857c]">Restaurant not found.</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className={shell}>
        <p className="text-sm text-[#8a857c]">Loading…</p>
      </main>
    );
  }

  return (
    <main className={shell}>
      <h1 className="text-2xl font-semibold tracking-tight">{data.name}</h1>
      <p className="mt-1 text-sm text-[#8a857c]">
        {data.cuisine} · {data.area}
      </p>

      <div className="mt-10 flex items-baseline gap-3">
        <span className="text-7xl font-semibold leading-none tracking-tight">
          {data.averageRating ?? "–"}
        </span>
        <span className="text-sm text-[#8a857c]">
          {data.totalReviews} {data.totalReviews === 1 ? "review" : "reviews"}
        </span>
      </div>

      {data.totalReviews === 0 ? (
        <div className="mt-12 rounded-xl border border-[#e7e2da] bg-white p-8 text-center">
          <p className="font-medium">No reviews yet.</p>
          <p className="mt-1 text-sm text-[#8a857c]">
            Be the first to review {data.name}.
          </p>
          <Link
            href={`/review/${params.id}`}
            className="mt-6 inline-block rounded-lg bg-[#c2410c] px-5 py-3 text-sm font-medium text-white hover:bg-[#a93a0b]"
          >
            Write a review
          </Link>
        </div>
      ) : (
        <>
          {data.latestReview && (
            <article className="mt-10 rounded-xl border border-[#e7e2da] bg-white p-6">
              <p className="text-xs font-medium uppercase tracking-widest text-[#8a857c]">
                Latest review
              </p>
              <div className="mt-3">
                <Stars value={data.latestReview.rating} />
              </div>
              <p className="mt-3 text-[15px] leading-relaxed">
                {data.latestReview.comment}
              </p>
              <p className="mt-3 text-xs text-[#8a857c]">
                {formatDate(data.latestReview.createdAt)}
              </p>
            </article>
          )}

          {data.reviews.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xs font-medium uppercase tracking-widest text-[#8a857c]">
                Earlier reviews
              </h2>
              <ul className="mt-2 divide-y divide-[#ece7df]">
                {data.reviews.map((review) => (
                  <li key={review.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <Stars value={review.rating} />
                      <span className="text-xs text-[#8a857c]">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-[15px] leading-relaxed">
                      {review.comment}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Link
            href={`/review/${params.id}`}
            className="mt-10 block rounded-lg bg-[#c2410c] py-3.5 text-center text-[15px] font-medium text-white hover:bg-[#a93a0b]"
          >
            Write a review
          </Link>
        </>
      )}
    </main>
  );
}
