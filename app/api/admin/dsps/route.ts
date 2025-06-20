import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    const dsps = await db.collection("dsps").find({}).toArray()

    // Calculate performance metrics for each DSP
    const dspsWithPerformance = await Promise.all(
      dsps.map(async (dsp) => {
        const winCount = await db.collection("ad_requests").countDocuments({
          winner_dsp_id: dsp.id,
        })

        const totalRequests = await db.collection("ad_requests").countDocuments()

        const avgCpmResult = await db
          .collection("ad_requests")
          .aggregate([
            { $match: { winner_dsp_id: dsp.id } },
            { $group: { _id: null, avgCpm: { $avg: "$winning_bid_price" } } },
          ])
          .toArray()

        const avgCpm = avgCpmResult.length > 0 ? avgCpmResult[0].avgCpm : 0

        return {
          ...dsp,
          performance: {
            win_count: winCount,
            win_rate: totalRequests > 0 ? winCount / totalRequests : 0,
            average_cpm: avgCpm || 0,
          },
        }
      }),
    )

    return NextResponse.json(dspsWithPerformance)
  } catch (error) {
    console.error("Failed to fetch DSPs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { db } = await connectToDatabase()

    // Validate required fields
    const { id, name, targeting_rules, base_bid_price, ad_creative_image_url, ad_creative_click_url } = body

    if (!id || !name || base_bid_price <= 0) {
      return NextResponse.json({ error: "Missing required fields: id, name, and base_bid_price > 0" }, { status: 400 })
    }

    // Check if DSP ID already exists
    const existingDSP = await db.collection("dsps").findOne({ id })
    if (existingDSP) {
      return NextResponse.json({ error: "DSP with this ID already exists" }, { status: 409 })
    }

    // Create new DSP
    const newDSP = {
      id,
      name,
      targeting_rules: targeting_rules || {},
      base_bid_price: Number.parseFloat(base_bid_price),
      ad_creative_image_url:
        ad_creative_image_url || `https://via.placeholder.com/300x250/0088FE/FFFFFF?text=${encodeURIComponent(id)}`,
      ad_creative_click_url: ad_creative_click_url || `https://example.com/${id.toLowerCase()}-landing`,
      created_at: new Date(),
    }

    const result = await db.collection("dsps").insertOne(newDSP)

    return NextResponse.json(
      {
        message: "DSP created successfully",
        id: result.insertedId,
        dsp: newDSP,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Failed to create DSP:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
