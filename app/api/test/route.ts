// app/api/test/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function GET() {
  await connectDB();
  return NextResponse.json({ status: "✅ MongoDB connected successfully" });
}