import { ProFeatureGate } from "@/modules/billing/ui/components/pro-feature-gate"
import { TransferSkeleton } from "@/modules/dashboard/ui/components/report-skeleton"
import { OrgTransferView } from "@/modules/org-transfer/ui/views/org-transfer-view"

const Page = () => {
  return (
    <ProFeatureGate fallback={<TransferSkeleton />}>
      <OrgTransferView />
    </ProFeatureGate>
  )
}

export default Page
