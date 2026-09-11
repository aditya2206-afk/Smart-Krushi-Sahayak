import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEMO_USERS,
  requiredCertsVerified,
  seedChat,
  seedNotifications,
  seedOfficers,
  seedEnquiries,
  seedOrders,
  seedProducts,
  seedReviews,
  seedQueries,
  type CertStatus,
  type ChatMessage,
  type Enquiry,
  type Notification,
  type OfficerRecord,
  type Order,
  type Product,
  type Query,
  type QueryStatus,
  type Recommendation,
  type Review,
  type Role,
} from "./data";
import { setActiveLang, translate, type Lang } from "./i18n";

const STORAGE_KEY = "sks-prototype-state-v5";

export interface CartLine {
  productId: string;
  qty: number;
}

interface PersistedState {
  lang: Lang;
  role: Role | null;
  queries: Query[];
  products: Product[];
  orders: Order[];
  notifications: Notification[];
  chat: ChatMessage[];
  cart: CartLine[];
  savedSchemes: string[];
  bookmarks: string[];
  savedListings: string[];
  officers: OfficerRecord[];
  approvedOfficers: string[];
  rejectedOfficers: string[];
  approvedBuyers: string[];
  rejectedBuyers: string[];
  approvedSellers: string[];
  rejectedSellers: string[];
  enquiries: Enquiry[];
  reviews: Review[];
}

const initialState: PersistedState = {
  lang: "en",
  role: null,
  queries: seedQueries,
  products: seedProducts,
  orders: seedOrders,
  notifications: seedNotifications,
  chat: seedChat,
  cart: [],
  savedSchemes: ["S1"],
  bookmarks: ["A1"],
  savedListings: [],
  officers: seedOfficers,
  approvedOfficers: [],
  rejectedOfficers: [],
  approvedBuyers: [],
  rejectedBuyers: [],
  approvedSellers: [],
  rejectedSellers: [],
  enquiries: seedEnquiries,
  reviews: seedReviews,
};

interface StoreValue extends PersistedState {
  hydrated: boolean;
  t: (key: string) => string;
  setLang: (l: Lang) => void;
  loginAs: (r: Role) => void;
  logout: () => void;
  user: (typeof DEMO_USERS)[Role] | null;
  addQuery: (q: Query) => void;
  updateQueryStatus: (id: string, status: QueryStatus) => void;
  assignOfficer: (id: string, officer: string) => void;
  answerQuery: (id: string, rec: Recommendation) => void;
  notify: (n: Omit<Notification, "id" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: (role: Role) => void;
  unread: (role: Role) => number;
  addToCart: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  placeOrder: (o: Omit<Order, "id">) => string;
  setOrderStatus: (id: string, status: Order["status"]) => void;
  addProduct: (p: Product) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  sendChat: (m: Omit<ChatMessage, "id">) => void;
  toggleScheme: (id: string) => void;
  toggleBookmark: (id: string) => void;
  toggleSavedListing: (id: string) => void;
  approveOfficer: (id: string, name: string) => void;
  rejectOfficer: (id: string) => void;
  approveBuyer: (id: string, name: string) => void;
  rejectBuyer: (id: string) => void;
  approveSeller: (id: string, name: string) => void;
  rejectSeller: (id: string) => void;
  sendEnquiry: (e: {
    buyer: string;
    seller: string;
    product: string;
    productId: string;
    text: string;
  }) => void;
  replyEnquiry: (id: string, from: "buyer" | "seller", text: string) => void;
  addReview: (r: Omit<Review, "id">) => void;
  cancelOrder: (id: string) => void;
  setCertStatus: (officerId: string, certId: string, status: CertStatus, note?: string) => void;
  uploadCertificate: (officerId: string, certId: string, file: string) => void;
  verifyOfficerAccount: (officerId: string) => void;
  markAllCertsVerified: (officerId: string) => void;
  suspendOfficer: (officerId: string, reason: string) => void;
  restoreOfficer: (officerId: string) => void;
  saveOfficerNote: (officerId: string, note: string) => void;
}

/**
 * Keep one context instance across hot reloads. Without this, editing this file
 * hands components a brand-new context while the mounted provider still uses
 * the old one, which throws "useStore must be used inside StoreProvider".
 */
const globalStore = globalThis as unknown as {
  __sklStoreContext?: React.Context<StoreValue | null>;
};
const StoreContext = globalStore.__sklStoreContext ?? createContext<StoreValue | null>(null);
globalStore.__sklStoreContext = StoreContext;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  // Keep the global t() helper in sync before any child renders.
  setActiveLang(state.lang);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState, ...(JSON.parse(raw) as PersistedState) });
    } catch {
      /* ignore corrupt state */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full / unavailable */
    }
  }, [state, hydrated]);

  const patch = useCallback((fn: (s: PersistedState) => PersistedState) => setState(fn), []);

  const value = useMemo<StoreValue>(() => {
    const nid = () => Math.random().toString(36).slice(2, 9);
    return {
      ...state,
      hydrated,
      t: (key: string) => translate(state.lang, key),
      user: state.role ? DEMO_USERS[state.role] : null,
      setLang: (lang) => patch((s) => ({ ...s, lang })),
      loginAs: (role) => patch((s) => ({ ...s, role })),
      logout: () => patch((s) => ({ ...s, role: null })),
      addQuery: (q) =>
        patch((s) => ({
          ...s,
          queries: [q, ...s.queries],
          notifications: [
            {
              id: nid(),
              role: "officer",
              type: "announcement",
              title: "New Farmer Query",
              body: `${q.farmer} submitted a ${q.crop} query (${q.id}).`,
              time: "Just now",
              read: false,
            },
            ...s.notifications,
          ],
        })),
      updateQueryStatus: (id, status) =>
        patch((s) => ({
          ...s,
          queries: s.queries.map((q) => (q.id === id ? { ...q, status } : q)),
        })),
      assignOfficer: (id, officer) =>
        patch((s) => ({
          ...s,
          queries: s.queries.map((q) =>
            q.id === id
              ? {
                  ...q,
                  officer,
                  status: "Under Review" as QueryStatus,
                  timeline: q.timeline.map((tl) =>
                    tl.label === "Officer Assigned" || tl.label === "Under Review"
                      ? { ...tl, done: true, date: "Today" }
                      : tl,
                  ),
                }
              : q,
          ),
        })),
      answerQuery: (id, rec) =>
        patch((s) => ({
          ...s,
          queries: s.queries.map((q) =>
            q.id === id
              ? {
                  ...q,
                  status: "Expert Replied" as QueryStatus,
                  officer: rec.officer,
                  recommendation: rec,
                  updatedAt: rec.date,
                  timeline: q.timeline.map((tl) =>
                    ["Officer Assigned", "Under Review", "Recommendation Received"].includes(
                      tl.label,
                    )
                      ? { ...tl, done: true, date: tl.done ? tl.date : rec.date }
                      : tl,
                  ),
                }
              : q,
          ),
          notifications: [
            {
              id: nid(),
              role: "farmer" as Role,
              type: "chat" as const,
              title: "Expert Replied",
              body: `${rec.officer} shared a recommendation on ${id}.`,
              time: "Just now",
              read: false,
            },
            ...s.notifications,
          ],
        })),
      notify: (n) =>
        patch((s) => ({
          ...s,
          notifications: [{ ...n, id: nid(), read: false }, ...s.notifications],
        })),
      markRead: (id) =>
        patch((s) => ({
          ...s,
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      markAllRead: (role) =>
        patch((s) => ({
          ...s,
          notifications: s.notifications.map((n) => (n.role === role ? { ...n, read: true } : n)),
        })),
      unread: (role) => state.notifications.filter((n) => n.role === role && !n.read).length,
      addToCart: (productId, qty = 1) =>
        patch((s) => {
          const line = s.cart.find((c) => c.productId === productId);
          return {
            ...s,
            cart: line
              ? s.cart.map((c) => (c.productId === productId ? { ...c, qty: c.qty + qty } : c))
              : [...s.cart, { productId, qty }],
          };
        }),
      setQty: (productId, qty) =>
        patch((s) => ({
          ...s,
          cart: s.cart.map((c) =>
            c.productId === productId ? { ...c, qty: Math.max(1, qty) } : c,
          ),
        })),
      removeFromCart: (productId) =>
        patch((s) => ({ ...s, cart: s.cart.filter((c) => c.productId !== productId) })),
      clearCart: () => patch((s) => ({ ...s, cart: [] })),
      cartCount: state.cart.reduce((a, c) => a + c.qty, 0),
      placeOrder: (o) => {
        const id = `ORD-2026-${5541 + Math.floor(Math.random() * 400)}`;
        patch((s) => ({
          ...s,
          orders: [{ ...o, id }, ...s.orders],
          cart: [],
          products: s.products.map((p) => {
            const line = o.items.find((i) => i.productId === p.id);
            return line
              ? { ...p, stock: Math.max(0, p.stock - line.qty), orders: p.orders + line.qty }
              : p;
          }),
          notifications: [
            {
              id: nid(),
              role: "seller" as Role,
              type: "order" as const,
              title: "New Order Received",
              body: `Order ${id} placed by ${o.buyer} worth ₹${o.total.toLocaleString("en-IN")}.`,
              time: "Just now",
              read: false,
            },
            ...s.notifications,
          ],
        }));
        return id;
      },
      setOrderStatus: (id, status) =>
        patch((s) => ({
          ...s,
          orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
          notifications:
            status === "Confirmed" ||
            status === "Packed" ||
            status === "Out for Delivery" ||
            status === "Ready for Pickup" ||
            status === "Completed"
              ? [
                  {
                    id: nid(),
                    role: "buyer" as Role,
                    type: "order" as const,
                    title: `Order ${status}`,
                    body: `Your order ${id} is now ${status.toLowerCase()}.`,
                    time: "Just now",
                    read: false,
                  },
                  ...s.notifications,
                ]
              : s.notifications,
        })),
      addProduct: (p) => patch((s) => ({ ...s, products: [p, ...s.products] })),
      updateProduct: (id, up) =>
        patch((s) => ({
          ...s,
          products: s.products.map((p) => (p.id === id ? { ...p, ...up } : p)),
        })),
      deleteProduct: (id) =>
        patch((s) => ({ ...s, products: s.products.filter((p) => p.id !== id) })),
      sendChat: (m) => patch((s) => ({ ...s, chat: [...s.chat, { ...m, id: nid() }] })),
      toggleScheme: (id) =>
        patch((s) => ({
          ...s,
          savedSchemes: s.savedSchemes.includes(id)
            ? s.savedSchemes.filter((x) => x !== id)
            : [...s.savedSchemes, id],
        })),
      toggleBookmark: (id) =>
        patch((s) => ({
          ...s,
          bookmarks: s.bookmarks.includes(id)
            ? s.bookmarks.filter((x) => x !== id)
            : [...s.bookmarks, id],
        })),
      toggleSavedListing: (id) =>
        patch((s) => ({
          ...s,
          savedListings: s.savedListings.includes(id)
            ? s.savedListings.filter((x) => x !== id)
            : [...s.savedListings, id],
        })),
      approveOfficer: (id) =>
        patch((s) => ({ ...s, approvedOfficers: [...s.approvedOfficers, id] })),
      rejectOfficer: (id) =>
        patch((s) => ({ ...s, rejectedOfficers: [...s.rejectedOfficers, id] })),
      approveBuyer: (id, name) =>
        patch((s) => ({
          ...s,
          approvedBuyers: [...s.approvedBuyers, id],
          notifications: [
            {
              id: nid(),
              role: "buyer" as Role,
              type: "announcement" as const,
              title: "Account Verified",
              body: `${name} has been approved as a Verified Buyer.`,
              time: "Just now",
              read: false,
            },
            ...s.notifications,
          ],
        })),
      rejectBuyer: (id) => patch((s) => ({ ...s, rejectedBuyers: [...s.rejectedBuyers, id] })),
      approveSeller: (id, name) =>
        patch((s) => ({
          ...s,
          approvedSellers: [...s.approvedSellers, id],
          notifications: [
            {
              id: nid(),
              role: "seller",
              type: "announcement",
              title: "Account Verified",
              body: `${name} has been approved as a Verified Seller.`,
              time: "Just now",
              read: false,
            },
            ...s.notifications,
          ],
        })),
      rejectSeller: (id) => patch((s) => ({ ...s, rejectedSellers: [...s.rejectedSellers, id] })),
      sendEnquiry: (e) =>
        patch((s) => ({
          ...s,
          enquiries: [
            {
              id: nid(),
              buyer: e.buyer,
              seller: e.seller,
              product: e.product,
              productId: e.productId,
              time: "Just now",
              replied: false,
              messages: [{ from: "buyer" as const, text: e.text, time: "Just now" }],
            },
            ...s.enquiries,
          ],
          notifications: [
            {
              id: nid(),
              role: "seller" as Role,
              type: "chat" as const,
              title: "New Buyer Enquiry",
              body: `${e.buyer} asked about your ${e.product} listing.`,
              time: "Just now",
              read: false,
            },
            ...s.notifications,
          ],
        })),
      replyEnquiry: (id, from, text) =>
        patch((s) => ({
          ...s,
          enquiries: s.enquiries.map((e) =>
            e.id === id
              ? {
                  ...e,
                  replied: from === "seller" ? true : e.replied,
                  messages: [...e.messages, { from, text, time: "Just now" }],
                }
              : e,
          ),
          notifications: [
            {
              id: nid(),
              role: (from === "seller" ? "buyer" : "seller") as Role,
              type: "chat" as const,
              title: from === "seller" ? "Seller Replied" : "New Buyer Message",
              body: text,
              time: "Just now",
              read: false,
            },
            ...s.notifications,
          ],
        })),
      addReview: (r) => patch((s) => ({ ...s, reviews: [{ ...r, id: nid() }, ...s.reviews] })),
      cancelOrder: (id) =>
        patch((s) => ({
          ...s,
          orders: s.orders.map((o) => (o.id === id ? { ...o, status: "Cancelled" as const } : o)),
          products: s.products.map((p) => {
            const order = s.orders.find((o) => o.id === id);
            const line = order?.items.find((i) => i.productId === p.id);
            return line ? { ...p, stock: p.stock + line.qty } : p;
          }),
          notifications: [
            {
              id: nid(),
              role: "seller" as Role,
              type: "order" as const,
              title: "Order Cancelled",
              body: `Order ${id} was cancelled by the buyer.`,
              time: "Just now",
              read: false,
            },
            ...s.notifications,
          ],
        })),
      setCertStatus: (officerId, certId, status, note) =>
        patch((s) => {
          const officer = s.officers.find((o) => o.id === officerId);
          const cert = officer?.certificates.find((c) => c.id === certId);
          const label =
            status === "Verified"
              ? `${cert?.name ?? "Certificate"} has been verified.`
              : status === "Rejected"
                ? `${cert?.name ?? "Certificate"} was rejected. View reason.`
                : `Admin requested a new copy of your ${cert?.name ?? "certificate"}.`;
          return {
            ...s,
            officers: s.officers.map((o) =>
              o.id !== officerId
                ? o
                : {
                    ...o,
                    accountVerified: status === "Verified" ? o.accountVerified : false,
                    lastReviewedBy: "Platform Admin",
                    lastReviewedOn: "Today",
                    certificates: o.certificates.map((c) =>
                      c.id === certId ? { ...c, status, adminNote: note ?? "" } : c,
                    ),
                    activity: [
                      {
                        date: "Today",
                        text: `${cert?.name ?? "Certificate"} marked ${status} by Platform Admin.`,
                      },
                      ...o.activity,
                    ],
                  },
            ),
            notifications: [
              {
                id: nid(),
                role: "officer" as Role,
                type: "announcement" as const,
                title:
                  status === "Verified" ? "Certificate Verified" : "Certificate Action Required",
                body: label,
                time: "Just now",
                read: false,
              },
              ...s.notifications,
            ],
          };
        }),
      uploadCertificate: (officerId, certId, file) =>
        patch((s) => ({
          ...s,
          officers: s.officers.map((o) =>
            o.id !== officerId
              ? o
              : {
                  ...o,
                  certificates: o.certificates.map((c) =>
                    c.id === certId
                      ? {
                          ...c,
                          file,
                          status: "Pending Verification" as CertStatus,
                          adminNote: "",
                          uploadedAt: "Today",
                        }
                      : c,
                  ),
                  activity: [
                    { date: "Today", text: `${file} uploaded for re-verification.` },
                    ...o.activity,
                  ],
                },
          ),
        })),
      verifyOfficerAccount: (officerId) =>
        patch((s) => {
          const officer = s.officers.find((o) => o.id === officerId);
          if (!officer || !requiredCertsVerified(officer)) return s;
          return {
            ...s,
            officers: s.officers.map((o) =>
              o.id !== officerId
                ? o
                : {
                    ...o,
                    accountVerified: true,
                    status: "Active" as const,
                    lastReviewedBy: "Platform Admin",
                    lastReviewedOn: "Today",
                    activity: [
                      { date: "Today", text: "Account verified by Platform Admin." },
                      ...o.activity,
                    ],
                  },
            ),
            notifications: [
              {
                id: nid(),
                role: "officer" as Role,
                type: "announcement" as const,
                title: "Account Verified",
                body: "Your Krushi Adhikari account has been verified.",
                time: "Just now",
                read: false,
              },
              ...s.notifications,
            ],
          };
        }),
      markAllCertsVerified: (officerId) =>
        patch((s) => ({
          ...s,
          officers: s.officers.map((o) =>
            o.id !== officerId
              ? o
              : {
                  ...o,
                  certificates: o.certificates.map((c) => ({
                    ...c,
                    status: "Verified" as CertStatus,
                    adminNote: "",
                  })),
                  lastReviewedBy: "Platform Admin",
                  lastReviewedOn: "Today",
                  activity: [
                    { date: "Today", text: "All certificates verified by Platform Admin." },
                    ...o.activity,
                  ],
                },
          ),
        })),
      suspendOfficer: (officerId, reason) =>
        patch((s) => ({
          ...s,
          officers: s.officers.map((o) =>
            o.id !== officerId
              ? o
              : {
                  ...o,
                  status: "Suspended" as const,
                  suspendReason: reason,
                  activity: [
                    { date: "Today", text: `Account suspended by Platform Admin — ${reason}.` },
                    ...o.activity,
                  ],
                },
          ),
        })),
      restoreOfficer: (officerId) =>
        patch((s) => ({
          ...s,
          officers: s.officers.map((o) =>
            o.id !== officerId
              ? o
              : {
                  ...o,
                  status: "Active" as const,
                  activity: [
                    { date: "Today", text: "Account reactivated by Platform Admin." },
                    ...o.activity,
                  ],
                },
          ),
        })),
      saveOfficerNote: (officerId, note) =>
        patch((s) => ({
          ...s,
          officers: s.officers.map((o) =>
            o.id !== officerId
              ? o
              : {
                  ...o,
                  adminNote: note,
                  lastReviewedBy: "Platform Admin",
                  lastReviewedOn: "Today",
                },
          ),
        })),
    };
  }, [state, patch, hydrated]);

  return (
    <StoreContext.Provider value={value}>
      {/* re-render the whole tree when the language changes */}
      <div key={state.lang} className="contents">
        {children}
      </div>
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function inr(n: number | undefined | null) {
  const v = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return `₹${v.toLocaleString("en-IN")}`;
}
