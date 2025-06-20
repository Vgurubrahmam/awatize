import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    const requests = await db.collection("ad_requests").find({}).sort({ request_time: -1 }).limit(100).toArray()

    return NextResponse.json(requests)
  } catch (error) {
    console.error("Failed to fetch ad requests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
