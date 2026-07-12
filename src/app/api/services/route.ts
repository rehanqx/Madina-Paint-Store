import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Services GET route placeholder" });
}

export async function POST() {
  return NextResponse.json({ message: "Services POST route placeholder" });
}
