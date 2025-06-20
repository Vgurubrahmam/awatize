// Database seeding script
const { MongoClient } = require("mongodb")

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const dbName = process.env.MONGODB_DB || "ssp_auction_simulator"

async function seedDatabase() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db(dbName)

    console.log("Connected to MongoDB")

    // Clear existing data
    await db.collection("dsps").deleteMany({})
    await db.collection("ad_requests").deleteMany({})

    // Insert sample DSPs
    const sampleDSPs = [
      {
        id: "DSP_A",
        name: "Premium DSP Alpha",
        targeting_rules: { geo: "US", device: "mobile" },
        base_bid_price: 3.5,
        ad_creative_image_url: "https://via.placeholder.com/300x250/0088FE/FFFFFF?text=DSP+A",
        ad_creative_click_url: "https://example.com/dsp-a-landing",
      },
      {
        id: "DSP_B",
        name: "Global DSP Beta",
        targeting_rules: { geo: "US", device: "desktop" },
        base_bid_price: 2.5,
        ad_creative_image_url: "https://via.placeholder.com/300x250/00C49F/FFFFFF?text=DSP+B",
        ad_creative_click_url: "https://example.com/dsp-b-landing",
      },
      {
        id: "DSP_C",
        name: "Budget DSP Gamma",
        targeting_rules: {},
        base_bid_price: 1.0,
        ad_creative_image_url: "https://via.placeholder.com/300x250/FFBB28/FFFFFF?text=DSP+C",
        ad_creative_click_url: "https://example.com/dsp-c-landing",
      },
      {
        id: "DSP_D",
        name: "Mobile First DSP",
        targeting_rules: { device: "mobile" },
        base_bid_price: 2.8,
        ad_creative_image_url: "https://via.placeholder.com/300x250/FF8042/FFFFFF?text=DSP+D",
        ad_creative_click_url: "https://example.com/dsp-d-landing",
      },
      {
        id: "DSP_E",
        name: "International DSP",
        targeting_rules: { geo: "EU" },
        base_bid_price: 2.2,
        ad_creative_image_url: "https://via.placeholder.com/300x250/8884D8/FFFFFF?text=DSP+E",
        ad_creative_click_url: "https://example.com/dsp-e-landing",
      },
    ]

    await db.collection("dsps").insertMany(sampleDSPs)
    console.log("Sample DSPs inserted")

    // Generate sample ad requests for testing
    const sampleRequests = []
    const geos = ["US", "EU", "CA", "AU"]
    const devices = ["mobile", "desktop", "tablet"]
    const publishers = ["pub_001", "pub_002", "pub_003", "pub_004"]
    const adSlots = ["banner_top", "banner_side", "banner_bottom", "video_pre"]

    for (let i = 0; i < 100; i++) {
      const requestTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last 7 days

      sampleRequests.push({
        publisher_id: publishers[Math.floor(Math.random() * publishers.length)],
        ad_slot_id: adSlots[Math.floor(Math.random() * adSlots.length)],
        geo: geos[Math.floor(Math.random() * geos.length)],
        device: devices[Math.floor(Math.random() * devices.length)],
        request_time: requestTime.toISOString(),
        status: "completed",
        winner_dsp_id: sampleDSPs[Math.floor(Math.random() * sampleDSPs.length)].id,
        winning_bid_price: Math.round((1 + Math.random() * 4) * 100) / 100, // Random price between 1-5
        created_at: requestTime,
      })
    }

    await db.collection("ad_requests").insertMany(sampleRequests)
    console.log("Sample ad requests inserted")

    // Create indexes
    await db.collection("ad_requests").createIndex({ request_time: -1 })
    await db.collection("ad_requests").createIndex({ winner_dsp_id: 1 })
    await db.collection("dsps").createIndex({ id: 1 }, { unique: true })

    console.log("Database seeded successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await client.close()
  }
}

seedDatabase()
