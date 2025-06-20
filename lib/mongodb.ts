import { MongoClient, type Db } from "mongodb"

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const dbName = process.env.MONGODB_DB || "ssp_auction_simulator"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = new MongoClient(uri)
  console.log("Attempting to connect to the database...")
  await client.connect()
  console.log("Successfully connected to the database.")

  const db = client.db(dbName)

  cachedClient = client
  cachedDb = db

  return { client, db }
}

export async function initializeDatabase() {
  const { db } = await connectToDatabase()

  // Create indexes
  await db.collection("ad_requests").createIndex({ request_time: -1 })
  await db.collection("ad_requests").createIndex({ winner_dsp_id: 1 })
  await db.collection("dsps").createIndex({ id: 1 }, { unique: true })

  // Seed DSPs if collection is empty
  const dspCount = await db.collection("dsps").countDocuments()
  if (dspCount === 0) {
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
  }
}
