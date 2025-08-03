'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package } from 'lucide-react'

export default function SimpleInventory() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
        <p className="text-gray-600">Track and manage your cube inventory</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              3x3 Speed Cube
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Stock:</span>
                <Badge className="bg-green-100 text-green-800">25 units</Badge>
              </div>
              <div className="flex justify-between">
                <span>Price:</span>
                <span className="font-semibold">R89</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              2x2 Pocket Cube
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Stock:</span>
                <Badge className="bg-green-100 text-green-800">15 units</Badge>
              </div>
              <div className="flex justify-between">
                <span>Price:</span>
                <span className="font-semibold">R49</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Professional Timer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Stock:</span>
                <Badge className="bg-yellow-100 text-yellow-800">8 units</Badge>
              </div>
              <div className="flex justify-between">
                <span>Price:</span>
                <span className="font-semibold">R199</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}