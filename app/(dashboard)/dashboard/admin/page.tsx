import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata = { title: "Admin Dashboard — Digifulx AssetTrack" };

export default function AdminDashboard() {
    return <DashboardShell expectedRole="Admin" />;
}
