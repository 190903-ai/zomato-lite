"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TopBar } from "@/components/TopBar";

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

  function shell(inner: React.ReactNode) {
    return (
      <main className="min-h-screen">
        <TopBar />
        <div className="mx-auto w-full max-w-[560px] px-5 py-10">{inner}</div>
      </main>
    );
  }

  if (failed) {
    return shell(<p className="text-sm text-[#8a857c]">Restaurant not found.</p>);
  }

  if (!data) {
    return shell(<p className="text-sm text-[#8a857c]">Loading…</p>);
  }

  return shell(
    <>
      <section className="overflow-hidden rounded-2xl border border-[#f0ddd0] bg-[#fdf1e7]">
        <div className="p-6">
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
            {data.name}
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <span className="inline-block rounded-full border border-[#f0ddd0] bg-white px-3 py-1 text-xs font-medium text-[#c2410c]">
              {data.cuisine}
            </span>
            <span className="text-sm text-[#8a857c]">{data.area}</span>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-[#f3e3d4] bg-white px-6 py-5">
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-semibold leading-none tracking-tight">
              {data.averageRating ?? "–"}
            </span>
            <span className="text-sm text-[#b9b2a4]">/ 5</span>
          </div>
          <span className="text-sm text-[#8a857c]">
            {data.totalReviews} {data.totalReviews === 1 ? "review" : "reviews"}
          </span>
        </div>
      </section>

      {data.totalReviews === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[#ddd7cb] bg-white p-8 text-center">
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
            <article className="mt-6 rounded-2xl border border-l-4 border-[#e7e2da] border-l-[#c2410c] bg-white p-6">
              <p className="text-xs font-medium uppercase tracking-widest text-[#8a857c]">
                Latest review
              </p>
              <div className="mt-3">
                <Stars value={data.latestReview.rating} />
              </div>
              <p className="mt-3 text-[17px] leading-relaxed">
                {data.latestReview.comment}
              </p>
              <p className="mt-3 text-xs text-[#8a857c]">
                {formatDate(data.latestReview.createdAt)}
              </p>
            </article>
          )}

          {data.reviews.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xs font-medium uppercase tracking-widest text-[#8a857c]">
                Earlier reviews
              </h2>
              <ul className="mt-3 space-y-3">
                {data.reviews.map((review) => (
                  <li
                    key={review.id}
                    className="flex gap-4 rounded-2xl border border-[#e7e2da] bg-white p-5"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fdf4ee] text-sm font-semibold text-[#c2410c]">
                      {review.rating}
                    </span>
                    <div>
                      <p className="text-[15px] leading-relaxed">{review.comment}</p>
                      <p className="mt-2 text-xs text-[#8a857c]">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Link
            href={`/review/${params.id}`}
            className="mt-8 block rounded-xl bg-[#c2410c] py-3.5 text-center text-[15px] font-medium text-white hover:bg-[#a93a0b]"
          >
            Write a review
          </Link>
        </>
      )}
    </>
  );
}
