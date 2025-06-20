import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Get total requests
    const totalRequests = await db.collection("ad_requests").countDocuments()

    // Get DSP performance
    const dspPerformance = await db
      .collection("ad_requests")
      .aggregate([
        {
          $match: { winner_dsp_id: { $exists: true, $ne: null } },
        },
        {
          $group: {
            _id: "$winner_dsp_id",
            win_count: { $sum: 1 },
            average_cpm: { $avg: "$winning_bid_price" },
          },
        },
        {
          $project: {
            dsp_id: "$_id",
            win_count: 1,
            win_rate: { $divide: ["$win_count", totalRequests] },
            average_cpm: 1,
            _id: 0,
          },
        },
      ])
      .toArray()

    // Get CPM trend (last 24 hours, grouped by hour)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const cpmTrend = await db
      .collection("ad_requests")
      .aggregate([
        {
          $match: {
            request_time: { $gte: oneDayAgo.toISOString() },
            winning_bid_price: { $exists: true },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%dT%H:00:00Z",
                date: { $dateFromString: { dateString: "$request_time" } },
              },
            },
            average_cpm: { $avg: "$winning_bid_price" },
          },
        },
        {
          $project: {
            time_period: "$_id",
            average_cpm: 1,
            _id: 0,
          },
        },
        { $sort: { time_period: 1 } },
      ])
      .toArray()

    return NextResponse.json({
      total_requests: totalRequests,
      dsp_performance: dspPerformance,
      cmp_trend: cpmTrend,
    })
  } catch (error) {
    console.error("Failed to fetch analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
