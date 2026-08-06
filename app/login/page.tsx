import type { Metadata } from "next";
import LoginForm from "@/app/login/LoginForm";

export const metadata: Metadata = {
  title: "Sign In | VELORA",
};

export default function LoginPage() {
  return <LoginForm />;
}
