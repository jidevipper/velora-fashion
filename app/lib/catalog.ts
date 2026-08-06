import { getSupabase } from "@/app/lib/supabase";

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  available: boolean;
};

export type Collection = {
  id: string;
  name: string;
  tagline: string;
  image: string;
};

export const FALLBACK_PRODUCTS: Product[] = [
  { id: "1", name: "Luxury Jacket", price: 149, image: "/images/product-1.jpg", category: "Men", description: "", available: true },
  { id: "2", name: "Classic Suit", price: 220, image: "/images/product-2.jpg", category: "Men", description: "", available: true },
  { id: "3", name: "Designer Hoodie", price: 89, image: "/images/product-3.jpg", category: "Men", description: "", available: true },
  { id: "4", name: "Premium Sneakers", price: 170, image: "/images/product-4.jpg", category: "Accessories", description: "", available: true },
  { id: "5", name: "Street Fashion", price: 120, image: "/images/product-5.jpg", category: "Women", description: "", available: true },
  { id: "6", name: "Luxury Outfit", price: 260, image: "/images/product-6.jpg", category: "Women", description: "", available: true },
];

export const FALLBACK_COLLECTIONS: Collection[] = [
  { id: "1", name: "Men", tagline: "Modern Luxury", image: "/images/hero-2.jpg" },
  { id: "2", name: "Women", tagline: "Elegant Style", image: "/images/about.jpg" },
  { id: "3", name: "Accessories", tagline: "Premium Collection", image: "/images/collection.jpg" },
];

type ProductRow = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  available: boolean;
};

type CollectionRow = {
  id: string;
  name: string;
  tagline: string;
  image: string;
};

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    image: row.image,
    category: row.category,
    description: row.description,
    available: Boolean(row.available),
  };
}

/** Load products from Supabase, falling back to the static catalog. */
export async function fetchProducts(): Promise<Product[]> {
  const supabase = getSupabase();
  if (!supabase) return FALLBACK_PRODUCTS;
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });
    if (error || !data || data.length === 0) return FALLBACK_PRODUCTS;
    return (data as ProductRow[]).map(rowToProduct);
  } catch {
    return FALLBACK_PRODUCTS;
  }
}

/** Load collections from Supabase, falling back to the static catalog. */
export async function fetchCollections(): Promise<Collection[]> {
  const supabase = getSupabase();
  if (!supabase) return FALLBACK_COLLECTIONS;
  try {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return FALLBACK_COLLECTIONS;
    return (data as CollectionRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      tagline: row.tagline,
      image: row.image,
    }));
  } catch {
    return FALLBACK_COLLECTIONS;
  }
}
