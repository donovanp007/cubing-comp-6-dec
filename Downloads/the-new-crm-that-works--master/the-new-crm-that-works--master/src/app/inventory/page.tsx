import SimpleInventory from '@/components/inventory/SimpleInventory'

export default function InventoryPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 pt-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600 mt-1">Track and manage your cube inventory with detailed analytics</p>
      </div>
      <SimpleInventory />
    </div>
  )
}