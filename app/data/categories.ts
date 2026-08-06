import type { StaticImageData } from "next/image";
import menImg from "@/public/images/hero-2.jpg";
import womenImg from "@/public/images/about.jpg";
import accessoriesImg from "@/public/images/collection.jpg";

export type Category = {
  id: number;
  name: string;
  tagline: string;
  image: StaticImageData;
};

export const categories: Category[] = [
  { id: 1, name: "Men", tagline: "Modern Luxury", image: menImg },
  { id: 2, name: "Women", tagline: "Elegant Style", image: womenImg },
  { id: 3, name: "Accessories", tagline: "Premium Collection", image: accessoriesImg },
];
