import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

interface ReviewRow {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
}

function serializeReview(row: ReviewRow) {
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const restaurantId = Number(id);

  if (!Number.isInteger(restaurantId)) {
    return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  }

  const restaurantRows = (await sql.query(
    "SELECT name, cuisine, area FROM restaurants WHERE id = $1",
    [restaurantId]
  )) as { name: string; cuisine: string; area: string }[];

  if (restaurantRows.length === 0) {
    return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  }

  const statRows = (await sql.query(
    "SELECT AVG(rating)::float AS average_rating, COUNT(*)::int AS total FROM reviews WHERE restaurant_id = $1",
    [restaurantId]
  )) as { average_rating: number | null; total: number }[];

  const rawAverage = statRows[0].average_rating;
  const averageRating = rawAverage === null ? null : Math.round(rawAverage * 10) / 10;

  const latestRows = (await sql.query(
    "SELECT id, rating, comment, created_at FROM reviews WHERE restaurant_id = $1 ORDER BY created_at DESC LIMIT 1",
    [restaurantId]
  )) as ReviewRow[];

  const olderRows = latestRows.length
    ? ((await sql.query(
        "SELECT id, rating, comment, created_at FROM reviews WHERE restaurant_id = $1 AND id <> $2 ORDER BY created_at DESC",
        [restaurantId, latestRows[0].id]
      )) as ReviewRow[])
    : [];

  return NextResponse.json({
    name: restaurantRows[0].name,
    cuisine: restaurantRows[0].cuisine,
    area: restaurantRows[0].area,
    averageRating,
    totalReviews: statRows[0].total,
    latestReview: latestRows.length ? serializeReview(latestRows[0]) : null,
    reviews: olderRows.map(serializeReview),
  });
}
