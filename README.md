# SSP Ad Auction Simulator

A comprehensive Supply Side Platform (SSP) simulator built with Next.js, TypeScript, and MongoDB. This application simulates real-time ad auctions between multiple Demand Side Platforms (DSPs) and provides detailed analytics through an admin dashboard.

## Features

- **Real-time Ad Auctions**: Process ad requests and conduct auctions with multiple DSPs
- **DSP Management**: Configure and manage multiple Demand Side Platforms with custom targeting rules
- **Analytics Dashboard**: Monitor performance metrics, win rates, and CPM trends
- **Admin Panel**: Comprehensive interface for managing the auction system
- **REST API**: Complete API for ad requests and admin operations

## Technology Stack

- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB
- **UI Components**: shadcn/ui, Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ 
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## Installation & Setup

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd ssp-ad-auction-simulator
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Environment Configuration

Create a \`.env.local\` file in the root directory:

\`\`\`env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=ssp_auction_simulator

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

**Note**: Replace \`mongodb://localhost:27017\` with your MongoDB connection string if using MongoDB Atlas or a different setup.

### 4. Database Setup

Seed the database with sample data:

\`\`\`bash
npm run seed
\`\`\`

This will create:
- 5 sample DSPs with different targeting rules
- 100 sample ad requests for testing
- Required database indexes

### 5. Start the Development Server

\`\`\`bash
npm run dev
\`\`\`

The application will be available at \`http://localhost:3000\`

## Architecture & Data Flow

### System Architecture

1. **Frontend (Next.js App Router)**
   - Landing page with system overview
   - Admin dashboard with tabs for different views
   - Real-time analytics and charts

2. **Backend (Next.js API Routes)**
   - \`/api/ad-request\` - Main auction endpoint
   - \`/api/admin/*\` - Admin panel APIs
   - Business logic in service classes

3. **Database (MongoDB)**
   - \`dsps\` collection - DSP configurations
   - \`ad_requests\` collection - All ad requests and results

### Data Flow

1. **Ad Request Processing**:
   - Publisher sends POST request to \`/api/ad-request\`
   - System stores request in database
   - DSP Service evaluates each DSP's targeting rules
   - Auction Engine determines winner
   - Response sent with winning creative

2. **Admin Dashboard**:
   - Real-time data fetching from MongoDB
   - Analytics aggregation for charts
   - Performance metrics calculation

## API Endpoints

### Main Auction Endpoint

**POST /api/ad-request**

Process an ad request and return the winning ad creative.

**Request Body:**
\`\`\`json
{
  "publisher_id": "pub_001",
  "ad_slot_id": "banner_top",
  "geo": "US",
  "device": "mobile",
  "time": "2025-01-20T10:00:00Z"
}
\`\`\`

**Success Response (200):**
\`\`\`json
{
  "winner_dsp": "DSP_A",
  "bid_price": 3.5,
  "creative": {
    "image_url": "https://via.placeholder.com/300x250/0088FE/FFFFFF?text=DSP+A",
    "click_url": "https://example.com/dsp-a-landing"
  }
}
\`\`\`

**No Winner Response (204):**
\`\`\`json
{
  "message": "No eligible bids found"
}
\`\`\`

### Admin API Endpoints

- **GET /api/admin/ad-requests** - Retrieve all ad requests
- **GET /api/admin/dsps** - Retrieve all DSPs with performance metrics
- **GET /api/admin/analytics** - Get aggregated analytics data

## Database Schema (MongoDB)

### DSPs Collection
\`\`\`javascript
{
  _id: ObjectId,
  id: "DSP_A",                    // Unique DSP identifier
  name: "Premium DSP Alpha",       // Display name
  targeting_rules: {              // Targeting criteria
    geo: "US",
    device: "mobile"
  },
  base_bid_price: 3.5,           // Base bid price
  ad_creative_image_url: "...",   // Ad image URL
  ad_creative_click_url: "..."    // Click-through URL
}
\`\`\`

### Ad Requests Collection
\`\`\`javascript
{
  _id: ObjectId,
  publisher_id: "pub_001",        // Publisher identifier
  ad_slot_id: "banner_top",       // Ad slot identifier
  geo: "US",                      // Geographic location
  device: "mobile",               // Device type
  request_time: "2025-01-20T10:00:00Z", // Request timestamp
  winner_dsp_id: "DSP_A",         // Winning DSP (if any)
  winning_bid_price: 3.5,         // Winning bid price
  status: "completed",            // Request status
  creative: {                     // Winning creative
    image_url: "...",
    click_url: "..."
  },
  created_at: Date
}
\`\`\`

## DSP Bidding Logic

Each DSP evaluates incoming ad requests based on:

1. **Targeting Rules**: Geographic and device-based targeting
2. **Base Bid Price**: Starting bid amount for the DSP
3. **Premium Multipliers**: 
   - US + Mobile: 20% premium
   - US + Desktop: 10% premium
4. **Randomization**: ±20% random factor to simulate real-world bidding

## Sample Payloads

### Test Ad Request (cURL)

\`\`\`bash
curl -X POST http://localhost:3000/api/ad-request \\
  -H "Content-Type: application/json" \\
  -d '{
    "publisher_id": "test_publisher",
    "ad_slot_id": "banner_top",
    "geo": "US",
    "device": "mobile",
    "time": "2025-01-20T10:00:00Z"
  }'
\`\`\`

### Expected Response

\`\`\`json
{
  "winner_dsp": "DSP_A",
  "bid_price": 4.2,
  "creative": {
    "image_url": "https://via.placeholder.com/300x250/0088FE/FFFFFF?text=DSP+A",
    "click_url": "https://example.com/dsp-a-landing"
  }
}
\`\`\`

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
- \`npm run lint\` - Run ESLint
- \`npm run seed\` - Seed database with sample data

## Admin Dashboard Screenshots

The admin dashboard includes:

1. **Overview Tab**: Key metrics and summary statistics
2. **Ad Requests Tab**: Table of all processed ad requests
3. **DSPs Tab**: DSP configurations and performance metrics
4. **Analytics Tab**: Charts showing CPM trends and win rates

## Development Notes

- The application uses MongoDB with connection pooling for optimal performance
- DSP bidding logic is modular and easily extensible
- All timestamps are stored in ISO 8601 format
- The auction engine supports both first-price and second-price auctions
- Real-time updates can be implemented using WebSocket connections

## Production Deployment

For production deployment:

1. Set up MongoDB Atlas or dedicated MongoDB instance
2. Update \`MONGODB_URI\` in environment variables
3. Configure proper security headers
4. Set up monitoring and logging
5. Implement rate limiting for the ad-request endpoint

## License

This project is for educational and demonstration purposes.
\`\`\`
