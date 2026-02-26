import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata = { title: "Staff Dashboard — Digifulx AssetTrack" };

export default function StaffDashboard() {
    return <DashboardShell expectedRole="Staff" />;
}
