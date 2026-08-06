import type { Metadata } from "next";
import PlaceholderPage from "@/app/components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Payment Methods | VELORA",
};

export default function PaymentMethodsPage() {
  return (
    <PlaceholderPage
      title="Payment Methods"
      description="Save and manage your payment methods here. This feature is coming soon."
    />
  );
}
