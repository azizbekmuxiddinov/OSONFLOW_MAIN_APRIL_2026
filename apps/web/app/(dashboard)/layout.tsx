import { DashboardLayout } from "@/modules/dashboard/ui/layouts/dashboard-layout";

// Every dashboard page is per-organization and reads the URL (checkout
// results, setup steps), so none of them is prerendered. The layout used to
// get this implicitly by reading the sidebar cookie.
export const dynamic = "force-dynamic";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
};

export default Layout;
