interface DSP {
  id: string
  name: string
  targeting_rules: Record<string, any>
  base_bid_price: number
  ad_creative_image_url: string
  ad_creative_click_url: string
}

interface AdRequest {
  geo: string
  device: string
  publisher_id: string
  ad_slot_id: string
}

interface Bid {
  price: number
}

export class DSPService {
  getBid(dsp: DSP, adRequest: AdRequest): Bid | null {
    // Check if DSP should bid based on targeting rules
    if (!this.matchesTargeting(dsp.targeting_rules, adRequest)) {
      return null
    }

    // Calculate bid price based on targeting match
    let bidPrice = dsp.base_bid_price

    // Apply premium for specific combinations
    if (adRequest.geo === "US" && adRequest.device === "mobile") {
      bidPrice *= 1.2 // 20% premium
    } else if (adRequest.geo === "US" && adRequest.device === "desktop") {
      bidPrice *= 1.1 // 10% premium
    }

    // Add some randomness to simulate real-world bidding
    const randomFactor = 0.8 + Math.random() * 0.4 // Random between 0.8 and 1.2
    bidPrice *= randomFactor

    return { price: Math.round(bidPrice * 100) / 100 } // Round to 2 decimal places
  }

  private matchesTargeting(rules: Record<string, any>, adRequest: AdRequest): boolean {
    // If no rules, DSP bids on everything
    if (Object.keys(rules).length === 0) {
      return true
    }

    // Check each targeting rule
    for (const [key, value] of Object.entries(rules)) {
      if (key === "geo" && adRequest.geo !== value) {
        return false
      }
      if (key === "device" && adRequest.device !== value) {
        return false
      }
      // Add more targeting rules as needed
    }

    return true
  }
}
