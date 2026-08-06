"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { useSearch } from "@/app/components/SearchProvider";
import { products } from "@/app/data/products";

export default function ProductGrid() {
  const { query } = useSearch();
  const { addItem } = useCart();

  const filtered = query.trim()
    ? products.filter((product) =>
        product.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : products;

  return (
    <div className="product-grid">
      {filtered.map((product) => (
        <div className="product-card" key={product.id} id={`product-${product.id}`}>
          <Image
            src={product.image}
            alt={product.name}
            sizes="(min-width: 1200px) 25vw, (min-width: 900px) 33vw, 100vw"
          />
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
