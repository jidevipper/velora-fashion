"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  FALLBACK_COLLECTIONS,
  FALLBACK_PRODUCTS,
  fetchCollections,
  fetchProducts,
  type Collection,
  type Product,
} from "@/app/lib/catalog";

type CatalogContextValue = {
  products: Product[];
  collections: Collection[];
  loading: boolean;
  refresh: () => Promise<void>;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [collections, setCollections] = useState<Collection[]>(
    FALLBACK_COLLECTIONS
  );
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const [nextProducts, nextCollections] = await Promise.all([
      fetchProducts(),
      fetchCollections(),
    ]);
    setProducts(nextProducts);
    setCollections(nextCollections);
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <CatalogContext.Provider
      value={{ products, collections, loading, refresh }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
