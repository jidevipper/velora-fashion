"use client";

import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { useSearch } from "@/app/components/SearchProvider";
import { useCatalog } from "@/app/context/CatalogContext";

export default function ProductGrid() {
  const { query } = useSearch();
  const { addItem } = useCart();
  const { products, loading } = useCatalog();

  const available = products.filter((product) => product.available);
  const filtered = query.trim()
    ? available.filter((product) =>
        product.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : available;

  if (loading && products.length === 0) {
    return <p className="product-grid-loading">Loading collection...</p>;
  }

  return (
    <div className="product-grid">
      {filtered.map((product) => (
        <div className="product-card" key={product.id} id={`product-${product.id}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.image} alt={product.name} loading="lazy" />
          <div className="product-info">
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            <div className="product-buttons">
              <Link href="/product" className="btn-small details-btn">
                View Details
              </Link>
              <button
                className="btn-small cart-btn"
                onClick={() => addItem(product.id, product.name, product.price)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
