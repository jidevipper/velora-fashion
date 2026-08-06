"use client";

import Reveal from "@/app/components/Reveal";
import { useCatalog } from "@/app/context/CatalogContext";

export default function CategoryGrid() {
  const { collections } = useCatalog();

  return (
    <div className="category-grid">
      {collections.map((category) => (
        <Reveal key={category.id}>
          <div className="category-card" id={`category-${category.id}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={category.image} alt={`${category.name} Collection`} loading="lazy" />
            <div className="category-content">
              <h3>{category.name}</h3>
              <p>{category.tagline}</p>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
