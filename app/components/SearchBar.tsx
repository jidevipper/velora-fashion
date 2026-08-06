"use client";

import { useState } from "react";
import Image from "next/image";
import { useSearch } from "@/app/components/SearchProvider";
import { products } from "@/app/data/products";
import { categories } from "@/app/data/categories";

export default function SearchBar() {
  const { query, setQuery } = useSearch();
  const [focused, setFocused] = useState(false);

  const q = query.trim().toLowerCase();

  const productMatches = q
    ? products.filter((p) => p.name.toLowerCase().includes(q))
    : [];
  const categoryMatches = q
    ? categories.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.tagline.toLowerCase().includes(q)
      )
    : [];

  const hasResults = productMatches.length + categoryMatches.length > 0;
  const open = focused && q.length > 0;

  const jumpTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("search-highlight");
    setTimeout(() => el.classList.remove("search-highlight"), 2200);
    setQuery("");
    setFocused(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || !hasResults) return;
    const target =
      productMatches.length > 0
        ? `product-${productMatches[0].id}`
        : `category-${categoryMatches[0].id}`;
    jumpTo(target);
  };

  return (
    <section className="search-section" id="search">
      <div className="search-container">
        <input
          type="text"
          id="search-input"
          placeholder="Search products and categories..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={handleKeyDown}
        />
        <i className="fas fa-search" />

        {open && (
          <div className="search-results">
            {!hasResults && (
              <div className="search-no-results">
                No matches for &quot;{query}&quot;
              </div>
            )}

            {productMatches.length > 0 && (
              <>
                <div className="search-results-group-title">Products</div>
                {productMatches.map((product) => (
                  <div
                    key={product.id}
                    className="search-result-item"
                    onClick={() => jumpTo(`product-${product.id}`)}
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={44}
                      height={44}
                    />
                    <h4>{product.name}</h4>
                    <p>${product.price}</p>
                  </div>
                ))}
              </>
            )}

            {categoryMatches.length > 0 && (
              <>
                <div className="search-results-group-title">Categories</div>
                {categoryMatches.map((category) => (
                  <div
                    key={category.id}
                    className="search-result-item"
                    onClick={() => jumpTo(`category-${category.id}`)}
                  >
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={44}
                      height={44}
                    />
                    <h4>{category.name}</h4>
                    <span>{category.tagline}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
