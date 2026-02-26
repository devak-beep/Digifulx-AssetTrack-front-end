import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata = { title: "Superadmin Dashboard — Digifulx AssetTrack" };

export default function SuperadminDashboard() {
    return <DashboardShell expectedRole="Superadmin" />;
}
