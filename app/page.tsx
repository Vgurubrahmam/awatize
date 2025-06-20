import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Database, Zap, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">SSP Ad Auction Simulator</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A comprehensive Supply Side Platform simulator for managing ad auctions, DSP bidding, and real-time
            analytics.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="text-center">
              <Zap className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <CardTitle className="text-lg">Real-time Auctions</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Process ad requests and conduct auctions with multiple DSPs in real-time
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <CardTitle className="text-lg">DSP Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Configure and manage multiple Demand Side Platforms with custom targeting rules
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <BarChart3 className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <CardTitle className="text-lg">Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Monitor performance metrics, win rates, and CPM trends across all DSPs</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Database className="w-8 h-8 mx-auto text-orange-600 mb-2" />
              <CardTitle className="text-lg">Data Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Store and analyze all ad requests, bids, and auction results</CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link href="/admin">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Access Admin Dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">API Endpoint</h2>
          <div className="bg-gray-100 rounded-lg p-4">
            <code className="text-sm">POST /api/ad-request</code>
          </div>
          <p className="text-gray-600 mt-4">
            Send ad requests to this endpoint to trigger the auction process and receive winning ad creatives.
          </p>
        </div>
      </div>
    </div>
  )
}
