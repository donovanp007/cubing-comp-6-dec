import Layout from '@/components/dashboard/Layout'
import SimpleInventory from '@/components/inventory/SimpleInventory'

export default function InventoryPage() {
  return (
    <Layout
      title="Inventory Management"
      subtitle="Track and manage your cube inventory with detailed analytics"
      showAddButton={false}
    >
      <SimpleInventory />
    </Layout>
  )
}