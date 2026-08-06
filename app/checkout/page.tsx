import type { Metadata } from "next";
import CheckoutForm from "@/app/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout | VELORA",
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}
