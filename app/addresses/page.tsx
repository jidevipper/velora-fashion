import type { Metadata } from "next";
import PlaceholderPage from "@/app/components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Addresses | VELORA",
};

export default function AddressesPage() {
  return (
    <PlaceholderPage
      title="Addresses"
      description="Manage your saved shipping addresses here. This feature is coming soon."
    />
  );
}
