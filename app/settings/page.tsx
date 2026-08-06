import type { Metadata } from "next";
import PlaceholderPage from "@/app/components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Settings | VELORA",
};

export default function SettingsPage() {
  return (
    <PlaceholderPage
      title="Settings"
      description="Manage your account preferences here. This feature is coming soon."
    />
  );
}
