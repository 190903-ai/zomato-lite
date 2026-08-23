import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const payload = body as Record<string, unknown>;

  const rating = payload.rating;
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be a whole number between 1 and 5." },
      { status: 400 }
    );
  }

  const comment = typeof payload.comment === "string" ? payload.comment.trim() : "";
  if (comment === "") {
    return NextResponse.json(
      { error: "Comment cannot be empty." },
      { status: 400 }
    );
  }

  const restaurantId = payload.restaurantId;
  if (typeof restaurantId !== "number" || !Number.isInteger(restaurantId)) {
    return NextResponse.json(
      { error: "Restaurant not found." },
      { status: 400 }
    );
  }

  const matching = (await sql.query(
    "SELECT id FROM restaurants WHERE id = $1",
    [restaurantId]
  )) as { id: number }[];

  if (matching.length === 0) {
    return NextResponse.json(
      { error: "Restaurant not found." },
      { status: 400 }
    );
  }

  const inserted = (await sql.query(
    "INSERT INTO reviews (restaurant_id, rating, comment) VALUES ($1, $2, $3) RETURNING id",
    [restaurantId, rating, comment]
  )) as { id: number }[];

  return NextResponse.json(
    { success: true, reviewId: inserted[0].id },
    { status: 201 }
  );
}
