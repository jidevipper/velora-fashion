"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import CartPanel from "@/app/components/CartPanel";
import BackToTop from "@/app/components/BackToTop";

export default function SiteChrome() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <>
      <Navbar />
      <CartPanel />
      <BackToTop />
    </>
  );
}
