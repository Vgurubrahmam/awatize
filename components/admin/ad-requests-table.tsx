"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, RefreshCw, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AdRequest {
  _id: string
  publisher_id: string
  ad_slot_id: string
  geo: string
  device: string
  request_time: string
  winner_dsp_id?: string
  winning_bid_price?: number
  status: string
  creative?: {
    image_url: string
    click_url: string
  }
}

export default function AdRequestsTable() {
  const [requests, setRequests] = useState<AdRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/admin/ad-requests")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setRequests(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error("Failed to fetch ad requests:", error)
      setError(error.message || "Failed to fetch ad requests")
      toast({
        title: "Error",
        description: "Failed to fetch ad requests. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchRequests, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return dateString
    }
  }

  const formatPrice = (price?: number) => {
    return price ? `$${price.toFixed(2)}` : "-"
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "no_winner":
        return "secondary"
      case "processing":
        return "outline"
      default:
        return "secondary"
    }
  }

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading ad requests...</span>
      </div>
    )
  }

  if (error && requests.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4 text-center">{error}</p>
          <Button onClick={fetchRequests}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Recent Ad Requests</h3>
          <p className="text-sm text-gray-600">{requests.length} requests • Auto-refreshes every 30 seconds</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No Ad Requests Yet</h3>
              <p className="text-gray-600 mb-4">
                Ad requests will appear here once you start sending requests to the API.
              </p>
              <div className="bg-gray-100 rounded-lg p-4 text-left">
                <code className="text-sm">POST /api/ad-request</code>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Ad Requests History</CardTitle>
            <CardDescription>Latest {requests.length} ad requests and their auction results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Publisher ID</TableHead>
                    <TableHead>Ad Slot</TableHead>
                    <TableHead>Geo</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Winner DSP</TableHead>
                    <TableHead>Bid Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Creative</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell className="font-medium">{request.publisher_id}</TableCell>
                      <TableCell>{request.ad_slot_id}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {request.geo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {request.device}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(request.request_time)}</TableCell>
                      <TableCell>{request.winner_dsp_id || "-"}</TableCell>
                      <TableCell className="font-mono">{formatPrice(request.winning_bid_price)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(request.status)}>{request.status.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>
                        {request.creative ? (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={request.creative.click_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
