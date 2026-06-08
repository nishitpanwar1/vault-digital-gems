// Local data store with pub/sub for pseudo-realtime updates.
// Persists to localStorage and broadcasts via storage events (cross-tab) +
// custom events (same tab).

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  password: string; // demo only — plain text in localStorage
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

const KEY = "digitvault_db_v2";
const ADMIN_EMAIL = "nishitpanwar@gmail.com";

const SEED_PRODUCTS: Product[] = [];

function emptyDB(): DB {
  return {
    profiles: [],
    products: SEED_PRODUCTS,
    downloads: [],
    reviews: [],
    subscribers: [],
    session_user_id: null,
  };
}

const EVENT = "digitvault:update";

function read(): DB {
  if (typeof window === "undefined") return emptyDB();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const fresh = emptyDB();
      localStorage.setItem(KEY, JSON.stringify(fresh));
      return fresh;
    }
    return JSON.parse(raw) as DB;
  } catch {
    return emptyDB();
  }
}

function write(db: DB) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(db));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export const db = {
  get: read,
  set: write,
  reset: () => write(emptyDB()),
};

type Listener = () => void;
const listeners = new Set<Listener>();

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) listeners.forEach((l) => l());
  });
  window.addEventListener(EVENT, () => listeners.forEach((l) => l()));
}

export function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

// ============ AUTH ============

export function signUp(input: {
  full_name: string;
  email: string;
  password: string;
}): Profile {
  const cur = read();
  const email = input.email.trim().toLowerCase();
  if (cur.profiles.find((p) => p.email === email)) {
    throw new Error("An account with this email already exists.");
  }
  const profile: Profile = {
    id: crypto.randomUUID(),
    full_name: input.full_name.trim(),
    email,
    password: input.password,
    avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(input.full_name)}`,
    is_admin: email === ADMIN_EMAIL,
    created_at: new Date().toISOString(),
  };
  cur.profiles.push(profile);
  cur.session_user_id = profile.id;
  write(cur);
  return profile;
}

export function logIn(email: string, password: string): Profile {
  const cur = read();
  const e = email.trim().toLowerCase();
  const profile = cur.profiles.find((p) => p.email === e);
  if (!profile || profile.password !== password) {
    throw new Error("Invalid email or password.");
  }
  cur.session_user_id = profile.id;
  write(cur);
  return profile;
}

export function logOut() {
  const cur = read();
  cur.session_user_id = null;
  write(cur);
}

export function currentUser(): Profile | null {
  const cur = read();
  if (!cur.session_user_id) return null;
  return cur.profiles.find((p) => p.id === cur.session_user_id) ?? null;
}

export function updateProfile(id: string, patch: Partial<Profile>) {
  const cur = read();
  const i = cur.profiles.findIndex((p) => p.id === id);
  if (i === -1) return;
  cur.profiles[i] = { ...cur.profiles[i], ...patch };
  write(cur);
}

// ============ PRODUCTS ============

export function listProducts(opts?: { onlyPublished?: boolean }): Product[] {
  const cur = read();
  return opts?.onlyPublished
    ? cur.products.filter((p) => p.is_published)
    : cur.products;
}

export function getProduct(id: string): Product | undefined {
  return read().products.find((p) => p.id === id);
}

export function createProduct(p: Omit<Product, "id" | "created_at" | "download_count">) {
  const cur = read();
  cur.products.unshift({
    ...p,
    id: crypto.randomUUID(),
    download_count: 0,
    created_at: new Date().toISOString(),
  });
  write(cur);
}

export function updateProduct(id: string, patch: Partial<Product>) {
  const cur = read();
  const i = cur.products.findIndex((p) => p.id === id);
  if (i === -1) return;
  cur.products[i] = { ...cur.products[i], ...patch };
  write(cur);
}

export function deleteProduct(id: string) {
  const cur = read();
  cur.products = cur.products.filter((p) => p.id !== id);
  cur.downloads = cur.downloads.filter((d) => d.product_id !== id);
  cur.reviews = cur.reviews.filter((r) => r.product_id !== id);
  write(cur);
}

// ============ DOWNLOADS ============

export function recordDownload(userId: string, productId: string) {
  const cur = read();
  cur.downloads.unshift({
    id: crypto.randomUUID(),
    user_id: userId,
    product_id: productId,
    downloaded_at: new Date().toISOString(),
  });
  const i = cur.products.findIndex((p) => p.id === productId);
  if (i !== -1) cur.products[i].download_count += 1;
  write(cur);
}

export function userDownloads(userId: string): Download[] {
  return read().downloads.filter((d) => d.user_id === userId);
}

export function hasDownloaded(userId: string, productId: string): boolean {
  return read().downloads.some(
    (d) => d.user_id === userId && d.product_id === productId,
  );
}

// ============ REVIEWS ============

export function productReviews(productId: string): Review[] {
  return read().reviews.filter((r) => r.product_id === productId);
}

export function userReviewFor(userId: string, productId: string) {
  return read().reviews.find(
    (r) => r.user_id === userId && r.product_id === productId,
  );
}

export function upsertReview(input: {
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
}) {
  const cur = read();
  const i = cur.reviews.findIndex(
    (r) => r.user_id === input.user_id && r.product_id === input.product_id,
  );
  if (i !== -1) {
    cur.reviews[i] = {
      ...cur.reviews[i],
      rating: input.rating,
      comment: input.comment,
      created_at: new Date().toISOString(),
    };
  } else {
    cur.reviews.unshift({
      id: crypto.randomUUID(),
      ...input,
      created_at: new Date().toISOString(),
    });
  }
  write(cur);
}

export function deleteReview(id: string) {
  const cur = read();
  cur.reviews = cur.reviews.filter((r) => r.id !== id);
  write(cur);
}

export function addSubscriber(email: string) {
  const cur = read();
  const e = email.trim().toLowerCase();
  if (cur.subscribers.some((s) => s.email === e)) return;
  cur.subscribers.unshift({
    id: crypto.randomUUID(),
    email: e,
    created_at: new Date().toISOString(),
  });
  write(cur);
}
