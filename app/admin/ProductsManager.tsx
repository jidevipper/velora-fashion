"use client";

import { useState } from "react";
import { getSupabase } from "@/app/lib/supabase";
import { useCatalog } from "@/app/context/CatalogContext";
import type { Product } from "@/app/lib/catalog";

type ProductForm = {
  name: string;
  price: string;
  category: string;
  image: string;
  description: string;
  available: boolean;
};

const emptyForm: ProductForm = {
  name: "",
  price: "",
  category: "Men",
  image: "",
  description: "",
  available: true,
};

export default function ProductsManager() {
  const { products, collections, refresh } = useCatalog();
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCreate = () => {
    setEditing(null);
    setFormOpen(true);
    setForm({ ...emptyForm, category: collections[0]?.name ?? "Men" });
    setError(null);
  };

  const startEdit = (product: Product) => {
    setEditing(product);
    setFormOpen(true);
    setForm({
      name: product.name,
      price: String(product.price),
      category: product.category,
      image: product.image,
      description: product.description,
      available: product.available,
    });
    setError(null);
  };

  const closeForm = () => {
    setEditing(null);
    setFormOpen(false);
    setForm(emptyForm);
    setError(null);
  };

  const set = (field: keyof ProductForm) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) =>
    setForm((prev) => ({
      ...prev,
      [field]:
        field === "available"
          ? (event.target as HTMLInputElement).checked
          : event.target.value,
    }));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const supabase = getSupabase();
    if (!supabase) {
      setError("Database not available.");
      return;
    }
    const price = Number(form.price);
    if (!form.name.trim() || Number.isNaN(price) || price <= 0) {
      setError("Enter a name and a valid price.");
      return;
    }
    setBusy(true);
    const payload = {
      name: form.name.trim(),
      price,
      category: form.category,
      image: form.image.trim(),
      description: form.description.trim(),
      available: form.available,
    };
    const { error: dbError } = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    setBusy(false);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    closeForm();
    await refresh();
  };

  const toggleAvailable = async (product: Product) => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase
      .from("products")
      .update({ available: !product.available })
      .eq("id", product.id);
    await refresh();
  };

  const remove = async (product: Product) => {
    const supabase = getSupabase();
    if (!supabase) return;
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    await supabase.from("products").delete().eq("id", product.id);
    await refresh();
  };

  return (
    <div className="admin-section">
      <div className="admin-section-head">
        <h2>Products</h2>
        <button className="btn admin-add-btn" onClick={startCreate}>
          <i className="fas fa-plus" /> Add Product
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="admin-thumb"
                  />
                </td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td className="admin-order-total">${product.price}</td>
                <td>
                  <button
                    className={`admin-switch${product.available ? " on" : ""}`}
                    onClick={() => void toggleAvailable(product)}
                    title={product.available ? "In stock" : "Out of stock"}
                    aria-label={`Toggle availability of ${product.name}`}
                  >
                    <span />
                  </button>
                </td>
                <td>
                  <div className="admin-row-actions">
                    <button
                      className="btn-outline admin-mini-btn"
                      onClick={() => startEdit(product)}
                    >
                      <i className="fas fa-pen" /> Edit
                    </button>
                    <button
                      className="btn-outline admin-mini-btn admin-danger"
                      onClick={() => void remove(product)}
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <form className="admin-form" onSubmit={submit}>
          <h3>{editing ? `Edit — ${editing.name}` : "New Product"}</h3>
          <div className="admin-form-grid">
            <label>
              Name
              <input
                type="text"
                value={form.name}
                onChange={set("name")}
                placeholder="Product name"
              />
            </label>
            <label>
              Price ($)
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={set("price")}
                placeholder="0.00"
              />
            </label>
            <label>
              Collection
              <select value={form.category} onChange={set("category")}>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.name}>
                    {collection.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Image URL
              <input
                type="text"
                value={form.image}
                onChange={set("image")}
                placeholder="https://..."
              />
            </label>
            <label className="admin-form-full">
              Description
              <textarea
                value={form.description}
                onChange={set("description")}
                placeholder="Short description (optional)"
                rows={2}
              />
            </label>
            <label className="admin-form-check">
              <input
                type="checkbox"
                checked={form.available}
                onChange={set("available")}
              />
              Available for purchase
            </label>
          </div>

          {error && <p className="admin-form-error">{error}</p>}

          <div className="admin-form-actions">
            <button type="submit" className="btn" disabled={busy}>
              {busy ? (
                <>
                  <i className="fas fa-spinner fa-spin" /> Saving...
                </>
              ) : editing ? (
                "Save Changes"
              ) : (
                "Add Product"
              )}
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={closeForm}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
