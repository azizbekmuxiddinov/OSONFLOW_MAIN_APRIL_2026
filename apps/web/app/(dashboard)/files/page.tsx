import { ProFeatureGate } from "@/modules/billing/ui/components/pro-feature-gate"
import { KnowledgeSkeleton } from "@/modules/dashboard/ui/components/report-skeleton"
import { FilesView } from "@/modules/files/ui/views/files-view"

const Page = () => {
  return (
    <ProFeatureGate fallback={<KnowledgeSkeleton />}>
      <FilesView />
    </ProFeatureGate>
  )
}

export default Page
