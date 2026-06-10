import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Plus, Edit2, Trash2, X, Upload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDB } from "@/lib/use-store";
import { createProduct, deleteProduct, updateProduct, type Product } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Products — DigitVault Admin" }] }),
  component: AdminProducts,
});

function AdminProducts() {
  const data = useDB();
  const [editing, setEditing] = useState<Product | "new" | null>(null);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{data.products.length} total</p>
        </div>
        <Button onClick={() => setEditing("new")} className="gradient-primary text-primary-foreground">
          <Plus size={14} className="mr-1.5" /> Add product
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="text-left">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3 hidden md:table-cell">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Downloads</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.products.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.cover_image_url} className="h-10 w-14 rounded object-cover" alt="" />
                    <span className="line-clamp-1 font-medium">{p.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell capitalize text-muted-foreground">{p.category}</td>
                <td className="px-4 py-3">{p.price === 0 ? "Free" : `$${p.price}`}</td>
                <td className="px-4 py-3 tabular-nums">{p.download_count.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => { updateProduct(p.id, { is_published: !p.is_published }); toast.success(p.is_published ? "Unpublished" : "Published"); }}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${p.is_published ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}
                  >
                    {p.is_published ? "Published" : "Draft"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => setEditing(p)} className="rounded p-1.5 hover:bg-muted" aria-label="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => { if (confirm("Delete this product?")) { deleteProduct(p.id); toast.success("Deleted"); } }}
                      className="rounded p-1.5 text-destructive hover:bg-destructive/10"
                      aria-label="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductModal
          product={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function ProductModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const [form, setForm] = useState({
    title: product?.title ?? "",
    description: product?.description ?? "",
    category: product?.category ?? "ebooks",
    price: product?.price ?? 0,
    cover_image_url: product?.cover_image_url ?? "",
    file_url: product?.file_url ?? "",
    is_published: product?.is_published ?? true,
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>(form.cover_image_url);
  const [saving, setSaving] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function pickCover(f: File | null) {
    setCoverFile(f);
    if (f) setCoverPreview(URL.createObjectURL(f));
  }

  async function uploadTo(bucket: string, file: File): Promise<string> {
    const ext = file.name.split(".").pop() || "bin";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });
    if (error) throw error;
    if (bucket === "product-covers") {
      const { data, error: sErr } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (sErr || !data) throw sErr || new Error("sign failed");
      return data.signedUrl;
    }
    return `storage:product-files/${path}`;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title required");
    if (!product && !coverFile) return toast.error("Pick a cover image");
    if (!product && !productFile) return toast.error("Pick a product file");

    setSaving(true);
    try {
      let cover_image_url = form.cover_image_url;
      let file_url = form.file_url;
      if (coverFile) cover_image_url = await uploadTo("product-covers", coverFile);
      if (productFile) file_url = await uploadTo("product-files", productFile);

      const payload = { ...form, cover_image_url, file_url };
      if (product) {
        await updateProduct(product.id, payload as Partial<Product>);
        toast.success("Product updated");
      } else {
        await createProduct(payload as any);
        toast.success("Product created");
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{product ? "Edit product" : "New product"}</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-muted"><X size={16} /></button>
        </div>
        <form onSubmit={save} className="space-y-3">
          <Field label="Title">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={200} />
          </Field>
          <Field label="Description">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} maxLength={2000} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Product["category"] })} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                <option value="ebooks">E-Books</option>
                <option value="templates">Templates</option>
                <option value="bundles">Bundles</option>
                <option value="courses">Courses</option>
              </select>
            </Field>
            <Field label="Price (USD, 0 = free)">
              <Input type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </Field>
          </div>

          <Field label="Cover image">
            <div className="flex items-center gap-3">
              {coverPreview ? (
                <img src={coverPreview} alt="" className="h-16 w-24 rounded object-cover border" />
              ) : (
                <div className="flex h-16 w-24 items-center justify-center rounded border bg-muted text-xs text-muted-foreground">No image</div>
              )}
              <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickCover(e.target.files?.[0] ?? null)} />
              <Button type="button" variant="outline" onClick={() => coverRef.current?.click()}>
                <Upload size={14} className="mr-1.5" /> {coverFile ? "Change" : "Choose image"}
              </Button>
            </div>
            {coverFile && <p className="mt-1 truncate text-xs text-muted-foreground">{coverFile.name}</p>}
          </Field>

          <Field label="Product file (zip, pdf, etc.)">
            <div className="flex items-center gap-3">
              <input ref={fileRef} type="file" className="hidden" onChange={(e) => setProductFile(e.target.files?.[0] ?? null)} />
              <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload size={14} className="mr-1.5" /> {productFile ? "Change file" : "Choose file"}
              </Button>
              <span className="truncate text-xs text-muted-foreground">
                {productFile ? productFile.name : product?.file_url ? "Current file kept" : "No file selected"}
              </span>
            </div>
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
            Published
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" className="gradient-primary text-primary-foreground" disabled={saving}>
              {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
