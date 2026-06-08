// Lovable Cloud–backed store with realtime subscriptions.
// Keeps a small in-memory cache populated by initial fetches +
// postgres_changes streams so any component reading `useDB()` updates
// instantly across devices.

import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  is_admin: boolean;
  created_at: string;
};

export type Product = {
  id: string;
  title: string;
  description: string;
  category: "ebooks" | "templates" | "bundles" | "courses";
  price: number;
  cover_image_url: string;
  file_url: string;
  download_count: number;
  is_published: boolean;
  created_at: string;
};

export type Download = {
  id: string;
  user_id: string;
  product_id: string;
  downloaded_at: string;
};

export type Review = {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type Subscriber = { id: string; email: string; created_at: string };

type DB = {
  profiles: Profile[];
  products: Product[];
  downloads: Download[];
  reviews: Review[];
  subscribers: Subscriber[];
  session_user_id: string | null;
};

let state: DB = {
  profiles: [],
  products: [],
  downloads: [],
  reviews: [],
  subscribers: [],
  session_user_id: null,
};

let adminIds = new Set<string>();

const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}
export function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export const db = {
  get: () => state,
};

function decorateProfiles(rows: any[]): Profile[] {
  return rows.map((p) => ({
    id: p.id,
    full_name: p.full_name ?? "",
    email: p.email ?? "",
    avatar_url:
      p.avatar_url ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.full_name || p.email || "User")}`,
    is_admin: adminIds.has(p.id),
    created_at: p.created_at,
  }));
}

async function fetchProfiles() {
  const [{ data: roles }, { data: profs }] = await Promise.all([
    supabase.from("user_roles").select("user_id, role").eq("role", "admin"),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
  ]);
  adminIds = new Set((roles ?? []).map((r: any) => r.user_id));
  state = { ...state, profiles: decorateProfiles(profs ?? []) };
  notify();
}

async function fetchProducts() {
  const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  state = { ...state, products: (data ?? []) as Product[] };
  notify();
}

async function fetchDownloads() {
  const { data } = await supabase.from("downloads").select("*").order("downloaded_at", { ascending: false });
  state = { ...state, downloads: (data ?? []) as Download[] };
  notify();
}

async function fetchReviews() {
  const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
  state = { ...state, reviews: (data ?? []) as Review[] };
  notify();
}

async function fetchSubscribers() {
  const { data } = await supabase.from("subscribers").select("*").order("created_at", { ascending: false });
  state = { ...state, subscribers: (data ?? []) as Subscriber[] };
  notify();
}

let booted = false;
export function bootRealtime() {
  if (booted || typeof window === "undefined") return;
  booted = true;

  // Initial session
  supabase.auth.getSession().then(({ data }) => {
    state = { ...state, session_user_id: data.session?.user.id ?? null };
    notify();
    void refreshAll();
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    state = { ...state, session_user_id: session?.user.id ?? null };
    notify();
    void fetchProfiles();
    void fetchDownloads();
  });

  // Realtime
  supabase
    .channel("dv-products")
    .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => void fetchProducts())
    .subscribe();
  supabase
    .channel("dv-downloads")
    .on("postgres_changes", { event: "*", schema: "public", table: "downloads" }, () => void fetchDownloads())
    .subscribe();
  supabase
    .channel("dv-reviews")
    .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, () => void fetchReviews())
    .subscribe();
  supabase
    .channel("dv-profiles")
    .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => void fetchProfiles())
    .on("postgres_changes", { event: "*", schema: "public", table: "user_roles" }, () => void fetchProfiles())
    .subscribe();
  supabase
    .channel("dv-subs")
    .on("postgres_changes", { event: "*", schema: "public", table: "subscribers" }, () => void fetchSubscribers())
    .subscribe();
}

export async function refreshAll() {
  await Promise.all([fetchProfiles(), fetchProducts(), fetchReviews(), fetchDownloads(), fetchSubscribers()]);
}

// ============ AUTH ============

export async function signUp(input: { full_name: string; email: string; password: string }) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      data: { full_name: input.full_name.trim() },
      emailRedirectTo: `${window.location.origin}/`,
    },
  });
  if (error) throw error;
  return data;
}

export async function logIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  return data;
}

export async function logOut() {
  await supabase.auth.signOut();
}

export async function updateProfile(id: string, patch: Partial<Profile>) {
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: patch.full_name, avatar_url: patch.avatar_url })
    .eq("id", id);
  if (error) throw error;
}

// ============ PRODUCTS ============

export async function createProduct(p: Omit<Product, "id" | "created_at" | "download_count">) {
  const { error } = await supabase.from("products").insert({
    title: p.title,
    description: p.description,
    category: p.category,
    price: p.price,
    cover_image_url: p.cover_image_url,
    file_url: p.file_url,
    is_published: p.is_published,
  });
  if (error) throw error;
}

export async function updateProduct(id: string, patch: Partial<Product>) {
  const { error } = await supabase.from("products").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

// ============ DOWNLOADS ============

export async function recordDownload(userId: string, productId: string) {
  const { error } = await supabase.from("downloads").insert({ user_id: userId, product_id: productId });
  if (error) throw error;
}

export function hasDownloaded(userId: string, productId: string): boolean {
  return state.downloads.some((d) => d.user_id === userId && d.product_id === productId);
}

// ============ REVIEWS ============

export async function upsertReview(input: {
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
}) {
  const { error } = await supabase
    .from("reviews")
    .upsert(
      {
        user_id: input.user_id,
        product_id: input.product_id,
        rating: input.rating,
        comment: input.comment,
      },
      { onConflict: "user_id,product_id" },
    );
  if (error) throw error;
}

export async function deleteReview(id: string) {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw error;
}

// ============ SUBSCRIBERS ============

export async function addSubscriber(email: string) {
  const e = email.trim().toLowerCase();
  const { error } = await supabase.from("subscribers").insert({ email: e });
  if (error && !String(error.message).toLowerCase().includes("duplicate")) throw error;
}

// Boot on first import in the browser
if (typeof window !== "undefined") bootRealtime();
