import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata = { title: "HR Dashboard — Digifulx AssetTrack" };

export default function HRDashboard() {
    return <DashboardShell expectedRole="HR" />;
}
