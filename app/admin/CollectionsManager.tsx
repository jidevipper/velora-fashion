"use client";

import { useState } from "react";
import { getSupabase } from "@/app/lib/supabase";
import { useCatalog } from "@/app/context/CatalogContext";
import type { Collection } from "@/app/lib/catalog";

type CollectionForm = {
  name: string;
  tagline: string;
  image: string;
  sortOrder: string;
};

const emptyForm: CollectionForm = {
  name: "",
  tagline: "",
  image: "",
  sortOrder: "1",
};

export default function CollectionsManager() {
  const { collections, refresh } = useCatalog();
  const [editing, setEditing] = useState<Collection | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<CollectionForm>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCreate = () => {
    setEditing(null);
    setFormOpen(true);
    setForm({
      ...emptyForm,
      sortOrder: String(collections.length + 1),
    });
    setError(null);
  };

  const startEdit = (collection: Collection) => {
    setEditing(collection);
    setFormOpen(true);
    setForm({
      name: collection.name,
      tagline: collection.tagline,
      image: collection.image,
      sortOrder: String(
        collections.findIndex((c) => c.id === collection.id) + 1
      ),
    });
    setError(null);
  };

  const closeForm = () => {
    setEditing(null);
    setFormOpen(false);
    setForm(emptyForm);
    setError(null);
  };

  const set = (field: keyof CollectionForm) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const supabase = getSupabase();
    if (!supabase) {
      setError("Database not available.");
      return;
    }
    if (!form.name.trim()) {
      setError("Enter a collection name.");
      return;
    }
    setBusy(true);
    const payload = {
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      image: form.image.trim(),
      sort_order: Number(form.sortOrder) || 0,
    };
    const { error: dbError } = editing
      ? await supabase.from("collections").update(payload).eq("id", editing.id)
      : await supabase.from("collections").insert(payload);
    setBusy(false);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    closeForm();
    await refresh();
  };

  const move = async (collection: Collection, delta: number) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const index = collections.findIndex((c) => c.id === collection.id);
    const target = collections[index + delta];
    if (!target) return;
    await supabase
      .from("collections")
      .update({ sort_order: index + delta + 1 })
      .eq("id", collection.id);
    await supabase
      .from("collections")
      .update({ sort_order: index + 1 })
      .eq("id", target.id);
    await refresh();
  };

  const remove = async (collection: Collection) => {
    const supabase = getSupabase();
    if (!supabase) return;
    if (!window.confirm(`Delete the "${collection.name}" collection?`)) return;
    await supabase.from("collections").delete().eq("id", collection.id);
    await refresh();
  };

  return (
    <div className="admin-section">
      <div className="admin-section-head">
        <h2>Collections</h2>
        <button className="btn admin-add-btn" onClick={startCreate}>
          <i className="fas fa-plus" /> Add Collection
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Image</th>
              <th>Name</th>
              <th>Tagline</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((collection, index) => (
              <tr key={collection.id}>
                <td className="admin-order-id">{index + 1}</td>
                <td>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="admin-thumb"
                  />
                </td>
                <td>{collection.name}</td>
                <td>{collection.tagline}</td>
                <td>
                  <div className="admin-row-actions">
                    <button
                      className="btn-outline admin-mini-btn"
                      onClick={() => move(collection, -1)}
                      disabled={index === 0}
                      title="Move up"
                    >
                      <i className="fas fa-arrow-up" />
                    </button>
                    <button
                      className="btn-outline admin-mini-btn"
                      onClick={() => move(collection, 1)}
                      disabled={index === collections.length - 1}
                      title="Move down"
                    >
                      <i className="fas fa-arrow-down" />
                    </button>
                    <button
                      className="btn-outline admin-mini-btn"
                      onClick={() => startEdit(collection)}
                    >
                      <i className="fas fa-pen" /> Edit
                    </button>
                    <button
                      className="btn-outline admin-mini-btn admin-danger"
                      onClick={() => void remove(collection)}
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
          <h3>
            {editing ? `Edit — ${editing.name}` : "New Collection"}
          </h3>
          <div className="admin-form-grid">
            <label>
              Name
              <input
                type="text"
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. Men"
              />
            </label>
            <label>
              Tagline
              <input
                type="text"
                value={form.tagline}
                onChange={set("tagline")}
                placeholder="e.g. Modern Luxury"
              />
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
            <label>
              Display Order
              <input
                type="number"
                min="1"
                value={form.sortOrder}
                onChange={set("sortOrder")}
              />
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
                "Add Collection"
              )}
            </button>
            <button type="button" className="btn-outline" onClick={closeForm}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
