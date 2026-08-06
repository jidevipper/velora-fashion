import type { Metadata } from "next";
import { Cinzel, Poppins } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/app/context/CartContext";
import { AuthProvider } from "@/app/context/AuthContext";
import { SearchProvider } from "@/app/components/SearchProvider";
import SiteChrome from "@/app/components/SiteChrome";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cinzel",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "VELORA | Luxury Fashion",
  description:
    "Where timeless elegance meets modern confidence. Velora is a premium fashion destination.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${cinzel.variable} ${poppins.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
        />
      </head>
      <body>
        <CartProvider>
          <AuthProvider>
            <SearchProvider>
              <SiteChrome />
              {children}
            </SearchProvider>
          </AuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}
