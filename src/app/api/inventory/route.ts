import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Inventory GET route placeholder" });
}

export async function POST() {
  return NextResponse.json({ message: "Inventory POST route placeholder" });
}
