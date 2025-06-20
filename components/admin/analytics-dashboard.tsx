"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"
import { RefreshCw, Loader2, AlertCircle, TrendingUp, Users, DollarSign, Target } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AnalyticsData {
  total_requests: number
  dsp_performance: Array<{
    dsp_id: string
    win_count: number
    win_rate: number
    average_cpm: number
  }>
  cpm_trend: Array<{
    time_period: string
    average_cpm: number
  }>
}

interface AnalyticsDashboardProps {
  detailed?: boolean
}

export default function AnalyticsDashboard({ detailed = false }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/admin/analytics")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setAnalytics(data)
    } catch (error: any) {
      console.error("Failed to fetch analytics:", error)
      setError(error.message || "Failed to fetch analytics")
      toast({
        title: "Error",
        description: "Failed to fetch analytics. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()

    // Set up auto-refresh every 60 seconds for analytics
    const interval = setInterval(fetchAnalytics, 60000)
    return () => clearInterval(interval)
  }, [])

  const chartConfig = {
    cmp: {
      label: "CPM",
      color: "hsl(var(--chart-1))",
    },
    wins: {
      label: "Wins",
      color: "hsl(var(--chart-2))",
    },
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    )
  }

  if (error && !analytics) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Analytics</h3>
          <p className="text-gray-600 mb-4 text-center">{error}</p>
          <Button onClick={fetchAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
            <p className="text-gray-600 mb-4">Analytics will appear here once you have processed ad requests.</p>
            <Button onClick={fetchAnalytics}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalWins = analytics.dsp_performance.reduce((sum, dsp) => sum + dsp.win_count, 0)
  const averageCPM =
    analytics.dsp_performance.length > 0
      ? analytics.dsp_performance.reduce((sum, dsp) => sum + dsp.average_cpm, 0) / analytics.dsp_performance.length
      : 0
  const winRate = analytics.total_requests > 0 ? (totalWins / analytics.total_requests) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
          <p className="text-sm text-gray-600">Auto-refreshes every 60 seconds</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAnalytics} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_requests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active DSPs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.dsp_performance.length}</div>
            <p className="text-xs text-muted-foreground">Participating in auctions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CPM</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageCPM.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Across all DSPs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Auctions with winners</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>CPM Trend Over Time</CardTitle>
            <CardDescription>Average CPM by time period (last 24 hours)</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.cpm_trend && analytics.cpm_trend.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.cpm_trend}>
                    <XAxis dataKey="time_period" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="average_cpm"
                      stroke="var(--color-cmp)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-cmp)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">No trend data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>DSP Performance</CardTitle>
            <CardDescription>Win count by DSP</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.dsp_performance.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.dsp_performance}>
                    <XAxis dataKey="dsp_id" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="win_count" fill="var(--color-wins)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">No performance data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      {detailed && analytics.dsp_performance.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>DSP Win Distribution</CardTitle>
              <CardDescription>Distribution of wins across DSPs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.dsp_performance}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ dsp_id, win_count }) => `${dsp_id}: ${win_count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="win_count"
                    >
                      {analytics.dsp_performance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>DSP Performance Metrics</CardTitle>
              <CardDescription>Detailed performance breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.dsp_performance.map((dsp, index) => (
                  <div key={dsp.dsp_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <p className="font-medium">{dsp.dsp_id}</p>
                        <p className="text-sm text-gray-600">{dsp.win_count} wins</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${dsp.average_cpm.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">{(dsp.win_rate * 100).toFixed(1)}% rate</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
