import { ProFeatureGate } from "@/modules/billing/ui/components/pro-feature-gate"
import { MemorySkeleton } from "@/modules/dashboard/ui/components/report-skeleton"
import { CustomerMemoryView } from "@/modules/dashboard/ui/views/customer-memory-view"

const Page = () => {
  return (
    <ProFeatureGate fallback={<MemorySkeleton />}>
      <CustomerMemoryView />
    </ProFeatureGate>
  )
}

export default Page
