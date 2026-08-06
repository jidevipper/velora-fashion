"use client";

import { useEffect, useState } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      id="topBtn"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={{ display: visible ? "block" : "none" }}
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}
