"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Plus, Loader2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface DSP {
  _id: string
  id: string
  name: string
  targeting_rules: Record<string, any>
  base_bid_price: number
  ad_creative_image_url: string
  ad_creative_click_url: string
  performance?: {
    win_count: number
    win_rate: number
    average_cpm: number
  }
}

export default function DSPsTable() {
  const [dsps, setDsps] = useState<DSP[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newDSP, setNewDSP] = useState({
    id: '',
    name: '',
    targeting_rules: { geo: '', device: '' },
    base_bid_price: 0,
    ad_creative_image_url: '',
    ad_creative_click_url: ''
  })
  const { toast } = useToast()

  const fetchDSPs = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/dsps")
      if (!response.ok) throw new Error('Failed to fetch DSPs')
      const data = await response.json()
      setDsps(data)
    } catch (error) {
      console.error("Failed to fetch DSPs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch DSPs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createDSP = async () => {
    if (!newDSP.id || !newDSP.name || newDSP.base_bid_price <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/admin/dsps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newDSP,
          targeting_rules: {
            ...(newDSP.targeting_rules.geo && { geo: newDSP.targeting_rules.geo }),
            ...(newDSP.targeting_rules.device && { device: newDSP.targeting_rules.device })
          }
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create DSP')
      }

      await fetchDSPs()
      setShowCreateModal(false)
      setNewDSP({
        id: '',
        name: '',
        targeting_rules: { geo: '', device: '' },
        base_bid_price: 0,
        ad_creative_image_url: '',
        ad_creative_click_url: ''
      })
      
      toast({
        title: "Success",
        description: "DSP created successfully!",
      })
    } catch (error: any) {
      console.error('Failed to create DSP:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create DSP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  useEffect(() => {
    fetchDSPs()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading DSPs...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Configured DSPs</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchDSPs} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add DSP
          </Button>
        </div>
      </div>

      {dsps.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No DSPs configured yet.</p>
          <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First DSP
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {dsps.map((dsp) => (
            <Card key={dsp._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{dsp.name}</CardTitle>
                    <CardDescription>ID: {dsp.id}</CardDescription>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Base Bid Price</h4>
                    <p className="text-lg font-semibold">${dsp.base_bid_price.toFixed(2)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Targeting Rules</h4>
                    <div className="space-y-1">
                      {Object.keys(dsp.targeting_rules).length === 0 ? (
                        <Badge variant="secondary" className="text-xs">No targeting</Badge>
                      ) : (
                        Object.entries(dsp.targeting_rules).map(([key, value]) => (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {key}: {String(value)}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Win Rate</h4>
                    <p className="text-lg font-semibold">
                      {dsp.performance?.win_rate ? `${(dsp.performance.win_rate * 100).toFixed(1)}%` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Avg CPM</h4>
                    <p className="text-lg font-semibold">
                      {dsp.performance?.average_cpm ? `$${dsp.performance.average_cpm.toFixed(2)}` : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Ad Creative</h4>
                  <div className="flex items-center gap-4">
                    <img
                      src={dsp.ad_creative_image_url || "/placeholder.svg?height=64&width=64"}
                      alt="Ad Creative"
                      className="w-16 h-16 object-cover rounded border"
                    />
                    <div>
                      <p className="text-sm text-gray-600">Click URL:</p>
                      <a
                        href={dsp.ad_creative_click_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline break-all"
                      >
                        {dsp.ad_creative_click_url}
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create DSP Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New DSP</DialogTitle>
            <DialogDescription>
              Configure a new Demand Side Platform with targeting rules and bid settings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dsp-id">DSP ID *</Label>
                <Input
                  id="dsp-id"
                  placeholder="e.g., DSP_F"
                  value={newDSP.id}
                  onChange={(e) => setNewDSP({ ...newDSP, id: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dsp-name">DSP Name *</Label>
                <Input
                  id="dsp-name"
                  placeholder="e.g., Premium DSP"
                  value={newDSP.name}
                  onChange={(e) => setNewDSP({ ...newDSP, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bid-price">Base Bid Price ($) *</Label>
              <Input
                id="bid-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 2.50"
                value={newDSP.base_bid_price || ''}
                onChange={(e) => setNewDSP({ ...newDSP, base_bid_price: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="geo-targeting">Geographic Targeting</Label>
                <Select
                  value={newDSP.targeting_rules.geo}
                  onValueChange={(value) => 
                    setNewDSP({ 
                      ...newDSP, 
                      targeting_rules: { ...newDSP.targeting_rules, geo: value === 'none' ? '' : value }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select geo targeting" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No geo targeting</SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="EU">Europe</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="device-targeting">Device Targeting</Label>
                <Select
                  value={newDSP.targeting_rules.device}
                  onValueChange={(value) => 
                    setNewDSP({ 
                      ...newDSP, 
                      targeting_rules: { ...newDSP.targeting_rules, device: value === 'none' ? '' : value }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select device targeting" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No device targeting</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-url">Ad Creative Image URL</Label>
              <Input
                id="image-url"
                placeholder="https://example.com/ad-image.jpg"
                value={newDSP.ad_creative_image_url}
                onChange={(e) => setNewDSP({ ...newDSP, ad_creative_image_url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="click-url">Ad Creative Click URL</Label>
              <Input
                id="click-url"
                placeholder="https://example.com/landing-page"
                value={newDSP.ad_creative_click_url}
                onChange={(e) => setNewDSP({ ...newDSP, ad_creative_click_url: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={createDSP} disabled={isCreating}>
              {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create DSP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
