import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { DSPService } from "@/lib/dsp-service"
import { AuctionEngine } from "@/lib/auction-engine"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const { publisher_id, ad_slot_id, geo, device, time } = body

    if (!publisher_id || !ad_slot_id || !geo || !device || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Store the ad request
    const adRequest = {
      publisher_id,
      ad_slot_id,
      geo,
      device,
      request_time: time,
      status: "processing",
      created_at: new Date(),
    }

    const insertResult = await db.collection("ad_requests").insertOne(adRequest)
    const requestId = insertResult.insertedId

    // Get all DSPs and simulate bidding
    const dsps = await db.collection("dsps").find({}).toArray()
    const dspService = new DSPService()
    const auctionEngine = new AuctionEngine()

    // Collect bids from all DSPs
    const bids = []
    for (const dsp of dsps) {
      const bid = dspService.getBid(dsp, { geo, device, publisher_id, ad_slot_id })
      if (bid) {
        bids.push({
          dsp_id: dsp.id,
          bid_price: bid.price,
          creative: {
            image_url: dsp.ad_creative_image_url,
            click_url: dsp.ad_creative_click_url,
          },
        })
      }
    }

    // Run auction
    const winner = auctionEngine.runAuction(bids)

    if (winner) {
      // Update ad request with winner
      await db.collection("ad_requests").updateOne(
        { _id: requestId },
        {
          $set: {
            winner_dsp_id: winner.dsp_id,
            winning_bid_price: winner.bid_price,
            status: "completed",
            creative: winner.creative,
          },
        },
      )

      return NextResponse.json({
        winner_dsp: winner.dsp_id,
        bid_price: winner.bid_price,
        creative: winner.creative,
      })
    } else {
      // No winner
      await db.collection("ad_requests").updateOne({ _id: requestId }, { $set: { status: "no_winner" } })

      return NextResponse.json({ message: "No eligible bids found" }, { status: 204 })
    }
  } catch (error) {
    console.error("Ad request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
