"use client"

import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdRequestsTable from "@/components/admin/ad-requests-table"
import DSPsTable from "@/components/admin/dsps-table"
import AnalyticsDashboard from "@/components/admin/analytics-dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor and manage your SSP ad auction simulator</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Ad Requests</TabsTrigger>
          <TabsTrigger value="dsps">DSPs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <AnalyticsDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="requests">
          <Suspense
            fallback={
              <Card>
                <CardHeader>
                  <CardTitle>Ad Requests</CardTitle>
                  <CardDescription>Loading ad requests...</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                </CardContent>
              </Card>
            }
          >
            <AdRequestsTable />
          </Suspense>
        </TabsContent>

        <TabsContent value="dsps">
          <Suspense
            fallback={
              <Card>
                <CardHeader>
                  <CardTitle>Demand Side Platforms</CardTitle>
                  <CardDescription>Loading DSPs...</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                </CardContent>
              </Card>
            }
          >
            <DSPsTable />
          </Suspense>
        </TabsContent>

        <TabsContent value="analytics">
          <Suspense fallback={<LoadingSkeleton />}>
            <AnalyticsDashboard detailed />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
