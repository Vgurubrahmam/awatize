interface Bid {
  dsp_id: string
  bid_price: number
  creative: {
    image_url: string
    click_url: string
  }
}

export class AuctionEngine {
  runAuction(bids: Bid[]): Bid | null {
    if (bids.length === 0) {
      return null
    }

    // Simple first-price auction - highest bid wins
    const winner = bids.reduce((highest, current) => {
      return current.bid_price > highest.bid_price ? current : highest
    })

    return winner
  }

  // Alternative: Second-price auction implementation
  runSecondPriceAuction(bids: Bid[]): Bid | null {
    if (bids.length === 0) {
      return null
    }

    if (bids.length === 1) {
      return bids[0]
    }

    // Sort bids by price (descending)
    const sortedBids = [...bids].sort((a, b) => b.bid_price - a.bid_price)

    // Winner pays second-highest price
    const winner = { ...sortedBids[0] }
    winner.bid_price = sortedBids[1].bid_price

    return winner
  }
}
