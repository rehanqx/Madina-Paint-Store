import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Bookings GET route placeholder" });
}

export async function POST() {
  return NextResponse.json({ message: "Bookings POST route placeholder" });
}
