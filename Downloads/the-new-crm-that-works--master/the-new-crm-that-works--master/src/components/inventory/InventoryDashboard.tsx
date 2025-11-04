'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Search,
  Plus,
  Edit,
  Eye,
  Download,
  ShoppingCart
} from 'lucide-react'
import { InventoryItem } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface InventoryDashboardProps {
  loading?: boolean
}

// Mock inventory data
const mockInventoryItems: InventoryItem[] = [
  {
    id: '1',
    name: '3x3 Speed Cube',
    category: 'cube',
    sku: 'CUBE-3X3-001',
    cost_price: 45,
    selling_price: 89,
    current_stock: 25,
    minimum_stock: 10,
    supplier: 'CubeStore SA',
    description: 'Professional 3x3 speed cube with magnetic positioning',
    image_url: '/cubes/3x3-speed.jpg',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: '2x2 Pocket Cube',
    category: 'cube',
    sku: 'CUBE-2X2-001',
    cost_price: 25,
    selling_price: 49,
    current_stock: 15,
    minimum_stock: 8,
    supplier: 'CubeStore SA',
    description: 'Compact 2x2 cube perfect for beginners',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Professional Timer',
    category: 'accessory',
    sku: 'ACC-TIMER-001',
    cost_price: 120,
    selling_price: 199,
    current_stock: 8,
    minimum_stock: 5,
    supplier: 'SpeedCubing Pro',
    description: 'High precision speedcubing timer with tournament features',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: '4x4 Master Cube',
    category: 'cube',
    sku: 'CUBE-4X4-001',
    cost_price: 85,
    selling_price: 149,
    current_stock: 5,
    minimum_stock: 8,
    supplier: 'CubeStore SA',
    description: 'Advanced 4x4 cube for experienced solvers',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Cube Lubricant',
    category: 'accessory',
    sku: 'ACC-LUBE-001',
    cost_price: 15,
    selling_price: 29,
    current_stock: 30,
    minimum_stock: 15,
    supplier: 'SpeedCubing Pro',
    description: 'Premium silicone lubricant for smooth cube operation',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    name: 'Carrying Case',
    category: 'accessory',
    sku: 'ACC-CASE-001',
    cost_price: 35,
    selling_price: 69,
    current_stock: 2,
    minimum_stock: 10,
    supplier: 'CubeStore SA',
    description: 'Protective carrying case for multiple cubes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '7',
    name: 'Beginner Learning Guide',
    category: 'educational',
    sku: 'EDU-GUIDE-001',
    cost_price: 25,
    selling_price: 45,
    current_stock: 20,
    minimum_stock: 12,
    supplier: 'Education Plus',
    description: 'Comprehensive guide for learning cubing basics',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

export default function InventoryDashboard({ loading = false }: InventoryDashboardProps) {
  const [items, setItems] = useState<InventoryItem[]>(mockInventoryItems)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cube': return <Package className="h-4 w-4" />
      case 'accessory': return <Package className="h-4 w-4" />
      case 'educational': return <Package className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cube': return 'bg-blue-100 text-blue-800'
      case 'accessory': return 'bg-green-100 text-green-800'
      case 'educational': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.current_stock === 0) {
      return { status: 'out-of-stock', color: 'bg-red-100 text-red-800', label: 'Out of Stock' }
    } else if (item.current_stock <= item.minimum_stock) {
      return { status: 'low-stock', color: 'bg-yellow-100 text-yellow-800', label: 'Low Stock' }
    } else {
      return { status: 'in-stock', color: 'bg-green-100 text-green-800', label: 'In Stock' }
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const totalValue = items.reduce((sum, item) => sum + (item.current_stock * item.cost_price), 0)
  const lowStockItems = items.filter(item => item.current_stock <= item.minimum_stock).length
  const outOfStockItems = items.filter(item => item.current_stock === 0).length
  const totalItems = items.reduce((sum, item) => sum + item.current_stock, 0)

  const categories = [
    { id: 'all', name: 'All Items', count: items.length },
    { id: 'cube', name: 'Cubes', count: items.filter(i => i.category === 'cube').length },
    { id: 'accessory', name: 'Accessories', count: items.filter(i => i.category === 'accessory').length },
    { id: 'educational', name: 'Educational', count: items.filter(i => i.category === 'educational').length },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-gray-200 rounded-md animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600">Track and manage your cube inventory</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Package className="h-4 w-4 mr-2 text-blue-600" />
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
            <p className="text-xs text-gray-500">{items.length} unique products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-gray-500">at cost price</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
            <p className="text-xs text-gray-500">items need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
              Out of Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
            <p className="text-xs text-gray-500">items unavailable</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search items by name, SKU, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center space-x-1"
            >
              <span>{category.name}</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const stockStatus = getStockStatus(item)
          const profitMargin = ((item.selling_price - item.cost_price) / item.cost_price * 100).toFixed(1)
          
          return (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(item.category)}
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                  </div>
                  <Badge className={getCategoryColor(item.category)}>
                    {item.category}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{item.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">SKU: {item.sku}</span>
                  <Badge className={stockStatus.color}>
                    {stockStatus.label}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Current Stock</p>
                    <p className="text-lg font-bold">{item.current_stock}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Min. Stock</p>
                    <p className="text-lg font-bold text-gray-600">{item.minimum_stock}</p>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Cost Price</p>
                      <p className="font-semibold">{formatCurrency(item.cost_price)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Selling Price</p>
                      <p className="font-semibold text-green-600">{formatCurrency(item.selling_price)}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Profit Margin</p>
                    <p className="text-sm font-semibold text-blue-600">{profitMargin}%</p>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <p className="text-xs text-gray-500 mb-1">Total Value</p>
                  <p className="font-bold">{formatCurrency(item.current_stock * item.cost_price)}</p>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" className="flex-1">
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Reorder
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-sm text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  )
}