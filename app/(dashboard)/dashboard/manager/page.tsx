import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata = { title: "Manager Dashboard — Digifulx AssetTrack" };

export default function ManagerDashboard() {
    return <DashboardShell expectedRole="Manager" />;
}
