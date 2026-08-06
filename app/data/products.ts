import type { StaticImageData } from "next/image";
import product1 from "@/public/images/product-1.jpg";
import product2 from "@/public/images/product-2.jpg";
import product3 from "@/public/images/product-3.jpg";
import product4 from "@/public/images/product-4.jpg";
import product5 from "@/public/images/product-5.jpg";
import product6 from "@/public/images/product-6.jpg";

export type Product = {
  id: number;
  name: string;
  price: number;
  image: StaticImageData;
};

export const products: Product[] = [
  { id: 1, name: "Luxury Jacket", price: 149, image: product1 },
  { id: 2, name: "Classic Suit", price: 220, image: product2 },
  { id: 3, name: "Designer Hoodie", price: 89, image: product3 },
  { id: 4, name: "Premium Sneakers", price: 170, image: product4 },
  { id: 5, name: "Street Fashion", price: 120, image: product5 },
  { id: 6, name: "Luxury Outfit", price: 260, image: product6 },
];
