import soybeanImg from "@/assets/crop-soybean.jpg";
import cottonImg from "@/assets/crop-cotton.jpg";
import onionImg from "@/assets/crop-onion.jpg";
import leafImg from "@/assets/leaf-yellow.jpg";
import productImg from "@/assets/product-generic.jpg";
import tomatoImg from "@/assets/produce-tomato.jpg";
import potatoImg from "@/assets/produce-potato.jpg";
import chilliImg from "@/assets/produce-chilli.jpg";
import wheatImg from "@/assets/produce-wheat.jpg";
import sugarcaneImg from "@/assets/produce-sugarcane.jpg";
import grapesImg from "@/assets/produce-grapes.jpg";

export const cropImages = {
  Soybean: soybeanImg,
  Cotton: cottonImg,
  Onion: onionImg,
  Tomato: tomatoImg,
  Potato: potatoImg,
  Chilli: chilliImg,
  Wheat: wheatImg,
  Sugarcane: sugarcaneImg,
  Grapes: grapesImg,
  leaf: leafImg,
  product: productImg,
};

export type Role = "farmer" | "seller" | "officer" | "buyer" | "admin";

export type QueryStatus =
  "Pending" | "Under Review" | "Expert Replied" | "Follow-up Required" | "Resolved";

export interface Recommendation {
  diagnosis: string;
  treatment: string;
  fertilizer: string;
  fertilizerDose: string;
  pesticide: string;
  pesticideDose: string;
  precautions: string;
  followUp: string;
  officer: string;
  date: string;
  /** Optional spoken advisory recorded by the Krushi Adhikari. */
  voiceAdvisory?: { url: string; duration: string };
}

export interface TimelineEvent {
  label: string;
  date: string;
  done: boolean;
}

export interface Query {
  id: string;
  farmer: string;
  farmerVillage: string;
  district: string;
  crop: string;
  stage: string;
  title: string;
  description: string;
  images: string[];
  voiceNote?: string;
  createdAt: string;
  updatedAt: string;
  officer: string | null;
  status: QueryStatus;
  recommendation?: Recommendation;
  timeline: TimelineEvent[];
  extra?: { irrigation: string; soil: string; lastFertilizer: string; lastPesticide: string };
}

export type ProduceCategory =
  "Vegetable" | "Fruit" | "Grain" | "Pulse" | "Commercial Crop" | "Other";
export type PriceTrend = "Up" | "Down" | "Stable";
export type ListingStatus = "Available" | "Low Stock" | "Fast Moving" | "Unavailable" | "Sold Out";

/** A produce listing published by an agricultural produce seller. */
export interface Product {
  id: string;
  name: string;
  category: ProduceCategory;
  variety: string;
  grade: string;
  seller: string;
  location: string;
  market: string;
  price: number;
  marketPrice: number;
  trend: PriceTrend;
  stock: number;
  unit: string;
  minOrder: number;
  harvestDate: string;
  availableUntil: string;
  organic: boolean;
  rating: number;
  orders: number;
  verified: boolean;
  active: boolean;
  description: string;
  image: string;
}

export const PRODUCE_CATEGORIES: ProduceCategory[] = [
  "Vegetable",
  "Fruit",
  "Grain",
  "Pulse",
  "Commercial Crop",
  "Other",
];
export const PRODUCE_UNITS = ["kg", "quintal", "ton", "dozen", "crate"];
export const PRODUCE_GRADES = ["A", "B", "FAQ", "Premium", "Standard"];
export const MARKETS = [
  "Solapur Mandi",
  "Lasalgaon Mandi",
  "Nashik Mandi",
  "Pune Mandi",
  "Latur Mandi",
  "Kolhapur Mandi",
];

export type OrderStatus =
  | "New"
  | "Confirmed"
  | "Packed"
  | "Ready for Pickup"
  | "Out for Delivery"
  | "Completed"
  | "Cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
  unit: string;
}

export interface Order {
  id: string;
  /** Seller who owns the produce being sold. */
  seller: string;
  /** Buyer who placed the order. */
  buyer: string;
  buyerType: string;
  items: OrderItem[];
  total: number;
  address: string;
  mobile: string;
  payment: string;
  fulfilment: "Pickup" | "Delivery";
  date: string;
  status: OrderStatus;
}

export interface Notification {
  id: string;
  role: Role;
  type: "chat" | "weather" | "scheme" | "order" | "announcement";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  from: "farmer" | "officer";
  text: string;
  time: string;
  image?: string;
}

export const DISTRICTS = [
  "Solapur",
  "Pune",
  "Satara",
  "Sangli",
  "Kolhapur",
  "Nashik",
  "Ahmednagar",
  "Latur",
];

export const CROPS = ["Soybean", "Cotton", "Wheat", "Onion", "Sugarcane", "Tomato", "Other"];
export const STAGES = ["Sowing", "Germination", "Vegetative", "Flowering", "Fruiting", "Harvest"];

export const DEMO_USERS: Record<
  Role,
  { name: string; subtitle: string; meta: string; initials: string }
> = {
  farmer: {
    name: "Ramesh Patil",
    subtitle: "Farmer",
    meta: "Akluj, Solapur, Maharashtra",
    initials: "RP",
  },
  seller: {
    name: "Shree Krushi Produce",
    subtitle: "Agricultural Produce Seller",
    meta: "Produce Seller • Solapur, Maharashtra",
    initials: "SK",
  },
  officer: {
    name: "Dr. S. K. Deshmukh",
    subtitle: "Krushi Adhikari",
    meta: "Crop Protection & Soil Management • Solapur",
    initials: "SD",
  },
  buyer: {
    name: "Mahesh Traders",
    subtitle: "Buyer",
    meta: "Wholesaler • Solapur, Maharashtra",
    initials: "MT",
  },

  admin: {
    name: "Platform Admin",
    subtitle: "Administrator",
    meta: "Smart Krushi Sahayak • Maharashtra",
    initials: "AD",
  },
};

const today = "21 Aug 2026";

export const seedQueries: Query[] = [
  {
    id: "QRY-2026-1041",
    farmer: "Ramesh Patil",
    farmerVillage: "Akluj",
    district: "Solapur",
    crop: "Soybean",
    stage: "Vegetative",
    title: "Leaves turning yellow and curling",
    description:
      "Lower leaves of soybean started turning yellow 5 days back. Curling is seen on new leaves. Affected area is nearly half acre near the field boundary. Light rain last week.",
    images: [leafImg],
    voiceNote: "00:12",
    createdAt: "19 Aug 2026",
    updatedAt: "20 Aug 2026",
    officer: "Dr. S. K. Deshmukh",
    status: "Expert Replied",
    extra: {
      irrigation: "Drip",
      soil: "Medium Black Soil",
      lastFertilizer: "DAP at sowing",
      lastPesticide: "None in last 30 days",
    },
    recommendation: {
      diagnosis: "Possible Nitrogen Deficiency with early leaf spot symptoms",
      treatment:
        "Apply recommended nitrogen fertilizer after checking soil moisture. Remove severely affected leaves and improve field drainage.",
      fertilizer: "Urea 46% N",
      fertilizerDose: "45 kg/acre",
      pesticide: "Neem-based Bio Pesticide",
      pesticideDose: "5 ml/L water",
      precautions: "Do not apply during heavy rain. Spray in the early morning or late evening.",
      followUp: "Observe crop condition for 5-7 days and share fresh photographs.",
      officer: "Dr. S. K. Deshmukh",
      date: "20 Aug 2026",
    },
    timeline: [
      { label: "Query Submitted", date: "19 Aug 2026", done: true },
      { label: "Officer Assigned", date: "19 Aug 2026", done: true },
      { label: "Under Review", date: "20 Aug 2026", done: true },
      { label: "Recommendation Received", date: "20 Aug 2026", done: true },
      { label: "Follow-up", date: "Pending", done: false },
      { label: "Resolved", date: "Pending", done: false },
    ],
  },
  {
    id: "QRY-2026-1038",
    farmer: "Ramesh Patil",
    farmerVillage: "Akluj",
    district: "Solapur",
    crop: "Cotton",
    stage: "Flowering",
    title: "Pink bollworm seen in cotton bolls",
    description: "Small pink larvae found inside 3-4 bolls while inspecting the field.",
    images: [cottonImg],
    createdAt: "16 Aug 2026",
    updatedAt: "17 Aug 2026",
    officer: "Dr. S. K. Deshmukh",
    status: "Under Review",
    timeline: [
      { label: "Query Submitted", date: "16 Aug 2026", done: true },
      { label: "Officer Assigned", date: "16 Aug 2026", done: true },
      { label: "Under Review", date: "17 Aug 2026", done: true },
      { label: "Recommendation Received", date: "Pending", done: false },
      { label: "Follow-up", date: "Pending", done: false },
      { label: "Resolved", date: "Pending", done: false },
    ],
  },
  {
    id: "QRY-2026-1030",
    farmer: "Ramesh Patil",
    farmerVillage: "Akluj",
    district: "Solapur",
    crop: "Onion",
    stage: "Vegetative",
    title: "White tips on onion leaves",
    description: "Leaf tips are drying and turning white in patches.",
    images: [onionImg],
    createdAt: "02 Aug 2026",
    updatedAt: "05 Aug 2026",
    officer: "Dr. A. R. Jadhav",
    status: "Resolved",
    recommendation: {
      diagnosis: "Purple blotch initial stage",
      treatment: "Spray recommended fungicide and maintain field sanitation.",
      fertilizer: "Water soluble 19:19:19",
      fertilizerDose: "2 g/L water",
      pesticide: "Mancozeb 75% WP",
      pesticideDose: "2.5 g/L water",
      precautions: "Maintain 10 days spray interval, wear protective gear.",
      followUp: "Crop recovered, query closed after follow-up.",
      officer: "Dr. A. R. Jadhav",
      date: "05 Aug 2026",
    },
    timeline: [
      { label: "Query Submitted", date: "02 Aug 2026", done: true },
      { label: "Officer Assigned", date: "02 Aug 2026", done: true },
      { label: "Under Review", date: "03 Aug 2026", done: true },
      { label: "Recommendation Received", date: "04 Aug 2026", done: true },
      { label: "Follow-up", date: "05 Aug 2026", done: true },
      { label: "Resolved", date: "05 Aug 2026", done: true },
    ],
  },
  {
    id: "QRY-2026-1044",
    farmer: "Sunita Shinde",
    farmerVillage: "Baramati",
    district: "Pune",
    crop: "Tomato",
    stage: "Fruiting",
    title: "Fruit borer damage in tomato",
    description: "Holes seen on tomato fruits, nearly 20% fruits affected.",
    images: [leafImg],
    createdAt: today,
    updatedAt: today,
    officer: null,
    status: "Pending",
    timeline: [
      { label: "Query Submitted", date: today, done: true },
      { label: "Officer Assigned", date: "Pending", done: false },
      { label: "Under Review", date: "Pending", done: false },
      { label: "Recommendation Received", date: "Pending", done: false },
      { label: "Follow-up", date: "Pending", done: false },
      { label: "Resolved", date: "Pending", done: false },
    ],
  },
  {
    id: "QRY-2026-1043",
    farmer: "Vikas More",
    farmerVillage: "Karad",
    district: "Satara",
    crop: "Sugarcane",
    stage: "Vegetative",
    title: "Yellowing between leaf veins",
    description: "Interveinal yellowing observed across 1 acre of sugarcane.",
    images: [leafImg],
    createdAt: "20 Aug 2026",
    updatedAt: "20 Aug 2026",
    officer: null,
    status: "Pending",
    timeline: [
      { label: "Query Submitted", date: "20 Aug 2026", done: true },
      { label: "Officer Assigned", date: "Pending", done: false },
      { label: "Under Review", date: "Pending", done: false },
      { label: "Recommendation Received", date: "Pending", done: false },
      { label: "Follow-up", date: "Pending", done: false },
      { label: "Resolved", date: "Pending", done: false },
    ],
  },
  {
    id: "QRY-2026-1039",
    farmer: "Anita Kale",
    farmerVillage: "Sangola",
    district: "Solapur",
    crop: "Wheat",
    stage: "Germination",
    title: "Poor germination after sowing",
    description: "Only 60% seeds germinated in the plot.",
    images: [soybeanImg],
    createdAt: "18 Aug 2026",
    updatedAt: "19 Aug 2026",
    officer: "Dr. S. K. Deshmukh",
    status: "Under Review",
    timeline: [
      { label: "Query Submitted", date: "18 Aug 2026", done: true },
      { label: "Officer Assigned", date: "18 Aug 2026", done: true },
      { label: "Under Review", date: "19 Aug 2026", done: true },
      { label: "Recommendation Received", date: "Pending", done: false },
      { label: "Follow-up", date: "Pending", done: false },
      { label: "Resolved", date: "Pending", done: false },
    ],
  },
];

export const seedProducts: Product[] = [
  {
    id: "P-101",
    name: "Tomato",
    category: "Vegetable",
    variety: "Hybrid Tomato",
    grade: "A",
    seller: "Shree Krushi Produce",
    location: "Solapur",
    market: "Solapur Mandi",
    price: 30,
    marketPrice: 28,
    trend: "Up",
    stock: 500,
    unit: "kg",
    minOrder: 20,
    harvestDate: "09 Sep 2026",
    availableUntil: "16 Sep 2026",
    organic: false,
    rating: 4.6,
    orders: 212,
    verified: true,
    active: true,
    description:
      "Firm, fresh hybrid tomatoes graded and packed in crates, ready for pickup or delivery.",
    image: cropImages.Tomato,
  },
  {
    id: "P-102",
    name: "Onion",
    category: "Vegetable",
    variety: "Nashik Red",
    grade: "A",
    seller: "Vijay Produce Company",
    location: "Nashik",
    market: "Nashik Mandi",
    price: 42,
    marketPrice: 40,
    trend: "Down",
    stock: 800,
    unit: "kg",
    minOrder: 50,
    harvestDate: "05 Sep 2026",
    availableUntil: "30 Sep 2026",
    organic: false,
    rating: 4.5,
    orders: 186,
    verified: true,
    active: true,
    description: "Well cured Nashik Red onions with good shelf life, sorted for size and colour.",
    image: cropImages.Onion,
  },
  {
    id: "P-103",
    name: "Potato",
    category: "Vegetable",
    variety: "Jyoti",
    grade: "A",
    seller: "Jadhav Fresh Produce",
    location: "Pune",
    market: "Pune Mandi",
    price: 27,
    marketPrice: 26,
    trend: "Stable",
    stock: 600,
    unit: "kg",
    minOrder: 50,
    harvestDate: "02 Sep 2026",
    availableUntil: "25 Sep 2026",
    organic: false,
    rating: 4.3,
    orders: 141,
    verified: true,
    active: true,
    description: "Clean, uniform table potatoes suitable for retail and hotel supply.",
    image: cropImages.Potato,
  },
  {
    id: "P-104",
    name: "Green Chilli",
    category: "Vegetable",
    variety: "Jwala",
    grade: "A",
    seller: "Shree Krushi Produce",
    location: "Solapur",
    market: "Solapur Mandi",
    price: 62,
    marketPrice: 60,
    trend: "Up",
    stock: 200,
    unit: "kg",
    minOrder: 10,
    harvestDate: "08 Sep 2026",
    availableUntil: "14 Sep 2026",
    organic: true,
    rating: 4.7,
    orders: 98,
    verified: true,
    active: true,
    description:
      "Spicy Jwala green chilli harvested daily, organically grown without chemical sprays.",
    image: cropImages.Chilli,
  },
  {
    id: "P-105",
    name: "Soybean",
    category: "Grain",
    variety: "JS-335",
    grade: "FAQ",
    seller: "Shree Krushi Produce",
    location: "Latur",
    market: "Latur Mandi",
    price: 4250,
    marketPrice: 4200,
    trend: "Up",
    stock: 50,
    unit: "quintal",
    minOrder: 5,
    harvestDate: "28 Aug 2026",
    availableUntil: "31 Oct 2026",
    organic: false,
    rating: 4.6,
    orders: 74,
    verified: true,
    active: true,
    description: "Fair average quality soybean, cleaned and bagged, moisture within FAQ norms.",
    image: cropImages.Soybean,
  },
  {
    id: "P-106",
    name: "Wheat",
    category: "Grain",
    variety: "Lokwan",
    grade: "FAQ",
    seller: "Shree Krushi Produce",
    location: "Solapur",
    market: "Solapur Mandi",
    price: 2250,
    marketPrice: 2200,
    trend: "Stable",
    stock: 80,
    unit: "quintal",
    minOrder: 5,
    harvestDate: "20 Aug 2026",
    availableUntil: "30 Nov 2026",
    organic: false,
    rating: 4.4,
    orders: 120,
    verified: true,
    active: true,
    description: "Lokwan wheat with bold grain, suitable for flour mills and bulk buyers.",
    image: cropImages.Wheat,
  },
  {
    id: "P-107",
    name: "Sugarcane",
    category: "Commercial Crop",
    variety: "Co-86032",
    grade: "FAQ",
    seller: "Kadam Agro Produce",
    location: "Kolhapur",
    market: "Kolhapur Mandi",
    price: 3450,
    marketPrice: 3400,
    trend: "Up",
    stock: 120,
    unit: "quintal",
    minOrder: 10,
    harvestDate: "01 Sep 2026",
    availableUntil: "20 Oct 2026",
    organic: false,
    rating: 4.2,
    orders: 46,
    verified: true,
    active: true,
    description: "Mature Co-86032 sugarcane bundles with good sucrose recovery.",
    image: cropImages.Sugarcane,
  },
  {
    id: "P-108",
    name: "Grapes",
    category: "Fruit",
    variety: "Thompson Seedless",
    grade: "Premium",
    seller: "Vijay Produce Company",
    location: "Nashik",
    market: "Nashik Mandi",
    price: 78,
    marketPrice: 74,
    trend: "Up",
    stock: 0,
    unit: "kg",
    minOrder: 20,
    harvestDate: "22 Aug 2026",
    availableUntil: "10 Sep 2026",
    organic: false,
    rating: 4.8,
    orders: 63,
    verified: true,
    active: false,
    description: "Export grade Thompson Seedless grapes packed in punnets. Next lot expected soon.",
    image: cropImages.Grapes,
  },
];

export const seedOrders: Order[] = [
  {
    id: "ORD-1001",
    seller: "Shree Krushi Produce",
    buyer: "Mahesh Traders",
    buyerType: "Trader",
    items: [{ productId: "P-101", name: "Tomato", qty: 100, price: 30, unit: "kg" }],
    total: 3000,
    address: "Market Yard, Solapur, Maharashtra - 413001",
    mobile: "98220 44112",
    payment: "Cash on Pickup",
    fulfilment: "Pickup",
    date: today,
    status: "New",
  },
  {
    id: "ORD-1002",
    seller: "Shree Krushi Produce",
    buyer: "Patil Agro Buyers",
    buyerType: "Wholesaler",
    items: [{ productId: "P-105", name: "Soybean", qty: 10, price: 4250, unit: "quintal" }],
    total: 42500,
    address: "Ganj Road, Latur, Maharashtra - 413512",
    mobile: "94220 77331",
    payment: "UPI",
    fulfilment: "Delivery",
    date: today,
    status: "Confirmed",
  },
  {
    id: "ORD-1003",
    seller: "Shree Krushi Produce",
    buyer: "Mahesh Traders",
    buyerType: "Wholesaler",
    items: [{ productId: "P-104", name: "Green Chilli", qty: 25, price: 62, unit: "kg" }],
    total: 1550,
    address: "Market Yard, Solapur, Maharashtra - 413001",
    mobile: "98220 44112",
    payment: "UPI",
    fulfilment: "Delivery",
    date: "20 Aug 2026",
    status: "Packed",
  },
  {
    id: "ORD-1004",
    seller: "Vijay Produce Company",
    buyer: "Mahesh Traders",
    buyerType: "Wholesaler",
    items: [{ productId: "P-102", name: "Onion", qty: 200, price: 42, unit: "kg" }],
    total: 8400,
    address: "Market Yard, Solapur, Maharashtra - 413001",
    mobile: "98220 44112",
    payment: "Cash on Pickup",
    fulfilment: "Pickup",
    date: "19 Aug 2026",
    status: "Completed",
  },
  {
    id: "ORD-1005",
    seller: "Shree Krushi Produce",
    buyer: "Annapurna Restaurant",
    buyerType: "Restaurant",
    items: [{ productId: "P-106", name: "Wheat", qty: 5, price: 2250, unit: "quintal" }],
    total: 11250,
    address: "Station Road, Solapur, Maharashtra - 413003",
    mobile: "99700 11889",
    payment: "Cash on Pickup",
    fulfilment: "Pickup",
    date: "18 Aug 2026",
    status: "Completed",
  },
];

/** Buyers who purchase produce from sellers. */
export const BUYERS = [
  {
    id: "B1",
    name: "Mahesh Traders",
    type: "Trader",
    phone: "98220 44112",
    location: "Solapur",
    orders: 24,
    spent: 184500,
    last: today,
    status: "Active",
  },
  {
    id: "B2",
    name: "Patil Agro Buyers",
    type: "Wholesaler",
    phone: "94220 77331",
    location: "Latur",
    orders: 18,
    spent: 512000,
    last: today,
    status: "Active",
  },
  {
    id: "B3",
    name: "Annapurna Restaurant",
    type: "Restaurant",
    phone: "99700 11889",
    location: "Solapur",
    orders: 31,
    spent: 96400,
    last: "20 Aug 2026",
    status: "Active",
  },
  {
    id: "B4",
    name: "Shinde Vegetable Retail",
    type: "Retailer",
    phone: "98901 44556",
    location: "Pune",
    orders: 12,
    spent: 78200,
    last: "19 Aug 2026",
    status: "Active",
  },
  {
    id: "B5",
    name: "Shree Krushi Produce",
    type: "Individual",
    phone: "98220 11223",
    location: "Solapur",
    orders: 4,
    spent: 23800,
    last: "18 Aug 2026",
    status: "Active",
  },
  {
    id: "B6",
    name: "Krushi Bhavan Canteen",
    type: "Institution",
    phone: "0217 2733 110",
    location: "Solapur",
    orders: 7,
    spent: 41200,
    last: "12 Aug 2026",
    status: "Inactive",
  },
];

/** Live mandi price board used by the Market Prices page. */
export const MARKET_PRICE_BOARD = [
  {
    id: "M1",
    product: "Tomato",
    category: "Vegetable",
    market: "Solapur Mandi",
    district: "Solapur",
    min: 24,
    max: 32,
    avg: 28,
    unit: "kg",
    change: 5.2,
    updated: "10 min ago",
  },
  {
    id: "M2",
    product: "Onion",
    category: "Vegetable",
    market: "Lasalgaon Mandi",
    district: "Nashik",
    min: 32,
    max: 46,
    avg: 40,
    unit: "kg",
    change: -2.1,
    updated: "15 min ago",
  },
  {
    id: "M3",
    product: "Potato",
    category: "Vegetable",
    market: "Pune Mandi",
    district: "Pune",
    min: 22,
    max: 30,
    avg: 26,
    unit: "kg",
    change: 0,
    updated: "20 min ago",
  },
  {
    id: "M4",
    product: "Green Chilli",
    category: "Vegetable",
    market: "Solapur Mandi",
    district: "Solapur",
    min: 52,
    max: 68,
    avg: 60,
    unit: "kg",
    change: 4.4,
    updated: "6 min ago",
  },
  {
    id: "M5",
    product: "Soybean",
    category: "Grain",
    market: "Latur Mandi",
    district: "Latur",
    min: 4000,
    max: 4350,
    avg: 4200,
    unit: "quintal",
    change: 1.8,
    updated: "8 min ago",
  },
  {
    id: "M6",
    product: "Wheat",
    category: "Grain",
    market: "Solapur Mandi",
    district: "Solapur",
    min: 2100,
    max: 2300,
    avg: 2200,
    unit: "quintal",
    change: 0,
    updated: "12 min ago",
  },
  {
    id: "M7",
    product: "Sugarcane",
    category: "Commercial Crop",
    market: "Kolhapur Mandi",
    district: "Kolhapur",
    min: 3300,
    max: 3520,
    avg: 3400,
    unit: "quintal",
    change: 1.2,
    updated: "25 min ago",
  },
  {
    id: "M8",
    product: "Grapes",
    category: "Fruit",
    market: "Nashik Mandi",
    district: "Nashik",
    min: 62,
    max: 88,
    avg: 74,
    unit: "kg",
    change: 3.1,
    updated: "18 min ago",
  },
  {
    id: "M9",
    product: "Tur",
    category: "Pulse",
    market: "Latur Mandi",
    district: "Latur",
    min: 8900,
    max: 9400,
    avg: 9150,
    unit: "quintal",
    change: -0.8,
    updated: "30 min ago",
  },
  {
    id: "M10",
    product: "Chana",
    category: "Pulse",
    market: "Solapur Mandi",
    district: "Solapur",
    min: 5200,
    max: 5600,
    avg: 5400,
    unit: "quintal",
    change: 0.6,
    updated: "35 min ago",
  },
];

/** 7 day price history per product for the market price trend chart. */
export const PRICE_HISTORY: Record<string, { day: string; price: number }[]> = {
  Tomato: [
    { day: "Thu", price: 24 },
    { day: "Fri", price: 25 },
    { day: "Sat", price: 26 },
    { day: "Sun", price: 25 },
    { day: "Mon", price: 27 },
    { day: "Tue", price: 27 },
    { day: "Wed", price: 28 },
  ],
  Onion: [
    { day: "Thu", price: 44 },
    { day: "Fri", price: 43 },
    { day: "Sat", price: 43 },
    { day: "Sun", price: 42 },
    { day: "Mon", price: 41 },
    { day: "Tue", price: 41 },
    { day: "Wed", price: 40 },
  ],
  Potato: [
    { day: "Thu", price: 26 },
    { day: "Fri", price: 26 },
    { day: "Sat", price: 25 },
    { day: "Sun", price: 26 },
    { day: "Mon", price: 26 },
    { day: "Tue", price: 26 },
    { day: "Wed", price: 26 },
  ],
  "Green Chilli": [
    { day: "Thu", price: 54 },
    { day: "Fri", price: 55 },
    { day: "Sat", price: 57 },
    { day: "Sun", price: 56 },
    { day: "Mon", price: 58 },
    { day: "Tue", price: 59 },
    { day: "Wed", price: 60 },
  ],
  Soybean: [
    { day: "Thu", price: 4080 },
    { day: "Fri", price: 4110 },
    { day: "Sat", price: 4140 },
    { day: "Sun", price: 4130 },
    { day: "Mon", price: 4160 },
    { day: "Tue", price: 4180 },
    { day: "Wed", price: 4200 },
  ],
  Wheat: [
    { day: "Thu", price: 2210 },
    { day: "Fri", price: 2205 },
    { day: "Sat", price: 2200 },
    { day: "Sun", price: 2200 },
    { day: "Mon", price: 2195 },
    { day: "Tue", price: 2200 },
    { day: "Wed", price: 2200 },
  ],
  Sugarcane: [
    { day: "Thu", price: 3340 },
    { day: "Fri", price: 3350 },
    { day: "Sat", price: 3360 },
    { day: "Sun", price: 3370 },
    { day: "Mon", price: 3380 },
    { day: "Tue", price: 3390 },
    { day: "Wed", price: 3400 },
  ],
  Grapes: [
    { day: "Thu", price: 68 },
    { day: "Fri", price: 69 },
    { day: "Sat", price: 70 },
    { day: "Sun", price: 71 },
    { day: "Mon", price: 72 },
    { day: "Tue", price: 73 },
    { day: "Wed", price: 74 },
  ],
  Tur: [
    { day: "Thu", price: 9250 },
    { day: "Fri", price: 9230 },
    { day: "Sat", price: 9210 },
    { day: "Sun", price: 9200 },
    { day: "Mon", price: 9180 },
    { day: "Tue", price: 9160 },
    { day: "Wed", price: 9150 },
  ],
  Chana: [
    { day: "Thu", price: 5350 },
    { day: "Fri", price: 5360 },
    { day: "Sat", price: 5370 },
    { day: "Sun", price: 5380 },
    { day: "Mon", price: 5390 },
    { day: "Tue", price: 5395 },
    { day: "Wed", price: 5400 },
  ],
};

export const seedNotifications: Notification[] = [
  {
    id: "N1",
    role: "farmer",
    type: "chat",
    title: "Expert Replied",
    body: "Dr. Deshmukh replied to your Soybean query QRY-2026-1041.",
    time: "2 minutes ago",
    read: false,
  },
  {
    id: "N2",
    role: "farmer",
    type: "weather",
    title: "Weather Alert",
    body: "Rain expected tomorrow evening in Solapur. Avoid pesticide spraying.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "N3",
    role: "farmer",
    type: "scheme",
    title: "Scheme Update",
    body: "PM-KISAN 17th instalment credited for eligible farmers.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "N4",
    role: "officer",
    type: "announcement",
    title: "New Farmer Query",
    body: "Sunita Shinde submitted a Tomato query from Pune district.",
    time: "10 minutes ago",
    read: false,
  },
  {
    id: "N5",
    role: "seller",
    type: "order",
    title: "New Order Received",
    body: "You received a new order for 100 kg Tomato from Mahesh Traders (ORD-1001).",
    time: "30 minutes ago",
    read: false,
  },
  {
    id: "N7",
    role: "seller",
    type: "announcement",
    title: "Market Price Changed",
    body: "Tomato market price increased by 5% in Solapur Mandi.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "N8",
    role: "seller",
    type: "announcement",
    title: "Low Stock Alert",
    body: "Only 200 kg Green Chilli remaining in your listing.",
    time: "3 hours ago",
    read: true,
  },
  {
    id: "N9",
    role: "buyer",
    type: "order",
    title: "Order Confirmed",
    body: "Your Green Chilli order ORD-1003 has been packed by Shree Krushi Produce.",
    time: "45 minutes ago",
    read: false,
  },
  {
    id: "N10",
    role: "buyer",
    type: "announcement",
    title: "Market Price Update",
    body: "Onion prices decreased by 2% in Lasalgaon Mandi.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "N11",
    role: "buyer",
    type: "chat",
    title: "Seller Replied",
    body: "Shree Krushi Produce replied to your Tomato enquiry.",
    time: "Yesterday",
    read: true,
  },

  {
    id: "N6",
    role: "admin",
    type: "announcement",
    title: "Pending Approvals",
    body: "3 Krushi Adhikari and 2 buyer applications await verification.",
    time: "Today",
    read: false,
  },
];

export const seedChat: ChatMessage[] = [
  {
    id: "C1",
    from: "farmer",
    text: "Namaskar sir, my soybean leaves are turning yellow. I have uploaded photos in query QRY-2026-1041.",
    time: "09:12 AM",
  },
  {
    id: "C2",
    from: "officer",
    text: "Namaskar Ramesh ji. I checked the photos. It looks like nitrogen deficiency along with early leaf spot.",
    time: "09:20 AM",
  },
  { id: "C3", from: "farmer", text: "What should I apply sir?", time: "09:22 AM" },
  {
    id: "C4",
    from: "officer",
    text: "Apply Urea 46% N at 45 kg per acre after checking soil moisture, and spray neem based bio pesticide at 5 ml per litre water.",
    time: "09:25 AM",
  },
  {
    id: "C5",
    from: "farmer",
    text: "Rain is expected tomorrow. Should I still spray?",
    time: "09:27 AM",
  },
  {
    id: "C6",
    from: "officer",
    text: "No, wait for 24 hours after rain stops. Spray in the early morning for best results.",
    time: "09:29 AM",
  },
];

export const SCHEMES = [
  {
    id: "S1",
    name: "PM-KISAN",
    gov: "Central Government",
    category: "Subsidy",
    eligibility: "Small and marginal farmer families holding cultivable land",
    benefit: "₹6,000 per year in three equal instalments",
    deadline: "31 Dec 2026",
    desc: "Income support scheme for eligible farmer families across India.",
  },
  {
    id: "S2",
    name: "Pradhan Mantri Fasal Bima Yojana",
    gov: "Central Government",
    category: "Insurance",
    eligibility: "All farmers growing notified crops in notified areas",
    benefit: "Crop insurance at 2% premium for kharif crops",
    deadline: "15 Sep 2026",
    desc: "Comprehensive crop insurance against natural calamities, pests and diseases.",
  },
  {
    id: "S3",
    name: "Soil Health Card Scheme",
    gov: "Central Government",
    category: "Crop",
    eligibility: "All farmers with cultivable land",
    benefit: "Free soil testing and nutrient recommendation card",
    deadline: "Ongoing",
    desc: "Soil nutrient status report with crop-wise fertilizer recommendations.",
  },
  {
    id: "S4",
    name: "PM-KUSUM",
    gov: "Central Government",
    category: "Equipment",
    eligibility: "Farmers with irrigation pump sets",
    benefit: "Up to 60% subsidy on solar pumps",
    deadline: "31 Oct 2026",
    desc: "Solar pump and grid connected solar power plant scheme for farmers.",
  },
  {
    id: "S5",
    name: "Maharashtra Krushi Yantrikikaran Subsidy",
    gov: "Maharashtra Government",
    category: "Equipment",
    eligibility: "Registered farmers of Maharashtra",
    benefit: "40-50% subsidy on approved farm machinery",
    deadline: "30 Nov 2026",
    desc: "Farm mechanisation subsidy for tractors, rotavators, sprayers and harvesters.",
  },
  {
    id: "S6",
    name: "Kisan Credit Card",
    gov: "Central Government",
    category: "Loan",
    eligibility: "Farmers, tenant farmers and sharecroppers",
    benefit: "Crop loan up to ₹3 lakh at 4% effective interest",
    deadline: "Ongoing",
    desc: "Short term credit for cultivation expenses and allied activities.",
  },
  {
    id: "S7",
    name: "Mahatma Jyotirao Phule Shetkari Karjmukti Yojana",
    gov: "Maharashtra Government",
    category: "Loan",
    eligibility: "Maharashtra farmers with eligible outstanding crop loans",
    benefit: "Crop loan waiver support",
    deadline: "31 Mar 2027",
    desc: "State scheme providing relief to farmers with outstanding crop loans.",
  },
  {
    id: "S8",
    name: "Birsa Munda Krushi Kranti Yojana",
    gov: "Maharashtra Government",
    category: "Farmer Category",
    eligibility: "Tribal farmer families of Maharashtra",
    benefit: "Assistance for well construction, pump sets and pipelines",
    deadline: "28 Feb 2027",
    desc: "Irrigation infrastructure support for tribal farmers.",
  },
];

export const SERVICES = [
  {
    id: "SV1",
    name: "Shree Krushi Seva Kendra",
    category: "Krushi Seva Kendra",
    distance: "2.4 km",
    rating: 4.6,
    hours: "9 AM - 7 PM",
    phone: "020 2456 1122",
    address: "Main Road, Akluj, Solapur",
    status: "Active",
    lat: "17.8845",
    lng: "75.0155",
  },
  {
    id: "SV2",
    name: "District Soil Testing Laboratory",
    category: "Soil Testing Lab",
    distance: "6.1 km",
    rating: 4.3,
    hours: "10 AM - 5 PM",
    phone: "0217 2731 400",
    address: "Krushi Bhavan, Solapur",
    status: "Active",
    lat: "17.6599",
    lng: "75.9064",
  },
  {
    id: "SV3",
    name: "Mahabeej Seed Store",
    category: "Seed Store",
    distance: "3.8 km",
    rating: 4.5,
    hours: "9 AM - 8 PM",
    phone: "0217 2298 771",
    address: "Market Yard, Pandharpur Road",
    status: "Active",
    lat: "17.7010",
    lng: "75.3300",
  },
  {
    id: "SV4",
    name: "Krushi Vikas Fertilizer Depot",
    category: "Fertilizer Store",
    distance: "1.9 km",
    rating: 4.2,
    hours: "8 AM - 8 PM",
    phone: "0217 2445 909",
    address: "Bus Stand Road, Akluj",
    status: "Active",
    lat: "17.8801",
    lng: "75.0201",
  },
  {
    id: "SV5",
    name: "Agro Pesticide House",
    category: "Pesticide Store",
    distance: "4.5 km",
    rating: 4.0,
    hours: "9 AM - 7 PM",
    phone: "0217 2119 003",
    address: "Sangola Road, Solapur",
    status: "Active",
    lat: "17.6400",
    lng: "75.8800",
  },
  {
    id: "SV6",
    name: "Taluka Agriculture Office",
    category: "Agriculture Office",
    distance: "5.2 km",
    rating: 4.4,
    hours: "10 AM - 6 PM",
    phone: "0217 2733 110",
    address: "Tehsil Compound, Malshiras",
    status: "Active",
    lat: "17.8500",
    lng: "74.9800",
  },
  {
    id: "SV7",
    name: "Kisan Equipment Rental",
    category: "Equipment Rental",
    distance: "7.8 km",
    rating: 4.1,
    hours: "7 AM - 9 PM",
    phone: "0217 2664 221",
    address: "MIDC Area, Solapur",
    status: "Inactive",
    lat: "17.6700",
    lng: "75.9200",
  },
];

export const ARTICLES = [
  {
    id: "A1",
    title: "How to Control Yellow Leaves in Soybean",
    category: "Crop Guides",
    read: "6 min read",
    excerpt:
      "Yellowing in soybean is commonly caused by nitrogen deficiency, waterlogging or early leaf spot. Learn how to identify each cause.",
  },
  {
    id: "A2",
    title: "Best Time to Spray Pesticides",
    category: "Pesticides",
    read: "4 min read",
    excerpt:
      "Spray timing decides effectiveness. Early morning and late evening sprays reduce evaporation and protect pollinators.",
  },
  {
    id: "A3",
    title: "Understanding Soil pH",
    category: "Soil Health",
    read: "5 min read",
    excerpt:
      "Soil pH controls nutrient availability. Learn ideal pH ranges for major Maharashtra crops and correction methods.",
  },
  {
    id: "A4",
    title: "Cotton Pest Management Guide",
    category: "Pest Management",
    read: "9 min read",
    excerpt:
      "Integrated pest management for pink bollworm, whitefly and jassids with trap based monitoring.",
  },
  {
    id: "A5",
    title: "Drip Irrigation for Small Farms",
    category: "Irrigation",
    read: "7 min read",
    excerpt: "Design, cost and subsidy details for setting up drip irrigation on one to two acres.",
  },
  {
    id: "A6",
    title: "Getting Started with Organic Farming",
    category: "Organic Farming",
    read: "8 min read",
    excerpt: "Compost, bio fertilizers and crop rotation practices for chemical free cultivation.",
  },
  {
    id: "A7",
    title: "Fertilizer Dose Calculation Made Simple",
    category: "Fertilizers",
    read: "5 min read",
    excerpt: "Convert soil health card recommendations into actual bag quantities per acre.",
  },
  {
    id: "A8",
    title: "How to Apply for PM-KISAN",
    category: "Government Programs",
    read: "3 min read",
    excerpt: "Step by step application process, documents required and status checking.",
  },
];

export const PESTICIDES = [
  {
    name: "Neem Bio Pesticide",
    target: "Aphids, whitefly, early larvae",
    dose: "5 ml/L water",
    crops: "Soybean, Cotton, Tomato",
    safety: "Safe for pollinators, spray in evening",
  },
  {
    name: "Mancozeb 75% WP",
    target: "Leaf spot, blight, purple blotch",
    dose: "2.5 g/L water",
    crops: "Onion, Tomato, Wheat",
    safety: "Wear gloves and mask while spraying",
  },
  {
    name: "Emamectin Benzoate 5% SG",
    target: "Pink bollworm, fruit borer",
    dose: "0.4 g/L water",
    crops: "Cotton, Tomato",
    safety: "Maintain 7 day pre-harvest interval",
  },
  {
    name: "Imidacloprid 17.8% SL",
    target: "Sucking pests, jassids",
    dose: "0.3 ml/L water",
    crops: "Cotton, Sugarcane",
    safety: "Avoid during flowering to protect bees",
  },
  {
    name: "Trichoderma viride",
    target: "Soil borne fungal diseases",
    dose: "5 g/kg seed treatment",
    crops: "Soybean, Wheat, Onion",
    safety: "Bio agent, do not mix with chemical fungicide",
  },
];

export const FERTILIZERS = [
  {
    name: "Urea 46% N",
    nutrient: "Nitrogen",
    dose: "45 kg/acre",
    crops: "Soybean, Wheat, Cotton",
    note: "Apply in split doses with adequate soil moisture",
  },
  {
    name: "DAP 18:46:0",
    nutrient: "Nitrogen + Phosphorus",
    dose: "50 kg/acre at sowing",
    crops: "All field crops",
    note: "Basal application at the time of sowing",
  },
  {
    name: "MOP 60% K",
    nutrient: "Potash",
    dose: "25 kg/acre",
    crops: "Onion, Sugarcane, Tomato",
    note: "Improves bulb and fruit quality",
  },
  {
    name: "Water Soluble 19:19:19",
    nutrient: "Balanced NPK",
    dose: "2 g/L foliar spray",
    crops: "Vegetables, Onion",
    note: "Best for quick recovery from stress",
  },
  {
    name: "Vermicompost",
    nutrient: "Organic matter",
    dose: "2 tonnes/acre",
    crops: "All crops",
    note: "Improves soil structure and microbial activity",
  },
];

export const CROP_CARDS = [
  {
    id: "CR1",
    name: "Soybean",
    area: "2 Acres",
    sowing: "15 June 2026",
    status: "Healthy" as const,
    image: soybeanImg,
    variety: "JS-335",
    irrigation: "Drip",
  },
  {
    id: "CR2",
    name: "Cotton",
    area: "3 Acres",
    sowing: "02 June 2026",
    status: "Needs Attention" as const,
    image: cottonImg,
    variety: "BT Cotton",
    irrigation: "Drip",
  },
  {
    id: "CR3",
    name: "Onion",
    area: "1.5 Acres",
    sowing: "20 July 2026",
    status: "Healthy" as const,
    image: onionImg,
    variety: "Nashik Red",
    irrigation: "Sprinkler",
  },
];

export const WEATHER = {
  location: "Solapur, Maharashtra",
  temp: 28,
  condition: "Partly Cloudy",
  humidity: 68,
  wind: 12,
  rain: 40,
  uv: 6,
  sunrise: "6:14 AM",
  sunset: "6:52 PM",
  forecast: [
    { day: "Fri", temp: 28, min: 22, cond: "Partly Cloudy", rain: 40 },
    { day: "Sat", temp: 27, min: 21, cond: "Light Rain", rain: 70 },
    { day: "Sun", temp: 26, min: 21, cond: "Rain", rain: 85 },
    { day: "Mon", temp: 29, min: 22, cond: "Cloudy", rain: 30 },
    { day: "Tue", temp: 31, min: 23, cond: "Sunny", rain: 10 },
    { day: "Wed", temp: 32, min: 24, cond: "Sunny", rain: 5 },
    { day: "Thu", temp: 30, min: 23, cond: "Partly Cloudy", rain: 20 },
  ],
};

export const MANDI_PRICES = [
  { crop: "Soybean", market: "Latur", price: 4200, change: 1.8 },
  { crop: "Wheat", market: "Solapur", price: 2200, change: 0 },
  { crop: "Sugarcane", market: "Kolhapur", price: 3400, change: 1.2 },
  { crop: "Tur", market: "Latur", price: 9150, change: -0.8 },
  { crop: "Chana", market: "Solapur", price: 5400, change: 0.6 },
];

export const PENDING_OFFICERS = [
  {
    id: "AP1",
    name: "Dr. P. M. Kulkarni",
    officerId: "MH-AGRI-4471",
    department: "Department of Agriculture, Maharashtra",
    designation: "Agriculture Officer",
    district: "Nashik",
    experience: "8 years",
    expertise: "Horticulture & Pest Management",
    doc: "officer-id-certificate.pdf",
    applied: "19 Aug 2026",
  },
  {
    id: "AP2",
    name: "Smt. R. B. Pawar",
    officerId: "MH-AGRI-5120",
    department: "Krushi Vibhag, Latur",
    designation: "Taluka Agriculture Officer",
    district: "Latur",
    experience: "5 years",
    expertise: "Soil Health & Dryland Farming",
    doc: "appointment-letter.pdf",
    applied: "20 Aug 2026",
  },
  {
    id: "AP3",
    name: "Shri. N. D. Salunkhe",
    officerId: "MH-AGRI-3390",
    department: "Krushi Vibhag, Kolhapur",
    designation: "Agriculture Assistant",
    district: "Kolhapur",
    experience: "11 years",
    expertise: "Sugarcane Agronomy",
    doc: "experience-certificate.pdf",
    applied: "21 Aug 2026",
  },
];

export const PENDING_SELLERS = [
  {
    id: "SP1",
    name: "Anil Pawar",
    business: "Pawar Fresh Produce",
    mobile: "98601 44221",
    district: "Sangli",
    categories: "Vegetables, Fruits",
    joined: "20 Aug 2026",
    status: "Pending",
  },
  {
    id: "SP2",
    name: "Meena Patil",
    business: "Patil Grain House",
    mobile: "97644 11390",
    district: "Latur",
    categories: "Grains, Pulses",
    joined: "21 Aug 2026",
    status: "Pending",
  },
];

export const PENDING_BUYERS = [
  {
    id: "BP1",
    name: "Ganesh Bhosale",
    shop: "Bhosale Produce Traders",
    buyerType: "Trader",
    license: "APMC/MH/2026/8841",
    gst: "27ABCDE1234F1Z5",
    location: "Sangli, Maharashtra",
    categories: "Vegetables, Fruits",
    docs: "apmc-licence.pdf, gst-certificate.pdf",
    applied: "20 Aug 2026",
  },
  {
    id: "BP2",
    name: "Rohit Jadhav",
    shop: "Jadhav Grain Buyers",
    buyerType: "Wholesaler",
    license: "APMC/MH/2026/1129",
    gst: "27FGHIJ5678K2Z9",
    location: "Ahmednagar, Maharashtra",
    categories: "Grains, Pulses",
    docs: "apmc-licence.pdf",
    applied: "21 Aug 2026",
  },
];

export const PLATFORM_USERS = [
  {
    name: "Ramesh Patil",
    role: "Farmer",
    mobile: "98220 11223",
    district: "Solapur",
    joined: "12 Mar 2026",
    verified: "Verified",
    status: "Active",
  },
  {
    name: "Sunita Shinde",
    role: "Farmer",
    mobile: "98901 44556",
    district: "Pune",
    joined: "04 Apr 2026",
    verified: "Verified",
    status: "Active",
  },
  {
    name: "Vikas More",
    role: "Farmer",
    mobile: "97654 22110",
    district: "Satara",
    joined: "22 May 2026",
    verified: "Pending",
    status: "Active",
  },
  {
    name: "Dr. S. K. Deshmukh",
    role: "Krushi Adhikari",
    mobile: "94220 88110",
    district: "Solapur",
    joined: "08 Jan 2026",
    verified: "Verified",
    status: "Active",
  },
  {
    name: "Dr. A. R. Jadhav",
    role: "Krushi Adhikari",
    mobile: "94033 55221",
    district: "Sangli",
    joined: "18 Feb 2026",
    verified: "Verified",
    status: "Active",
  },
  {
    name: "Shree Krushi Produce",
    role: "Seller",
    mobile: "98220 77330",
    district: "Solapur",
    joined: "18 Feb 2026",
    verified: "Verified",
    status: "Active",
  },
  {
    name: "Vijay Produce Company",
    role: "Seller",
    mobile: "90280 71145",
    district: "Nashik",
    joined: "11 Apr 2026",
    verified: "Verified",
    status: "Active",
  },
  {
    name: "Jadhav Fresh Produce",
    role: "Seller",
    mobile: "93700 88214",
    district: "Pune",
    joined: "02 May 2026",
    verified: "Verified",
    status: "Active",
  },
  {
    name: "Mahesh Traders",
    role: "Buyer",
    mobile: "98220 44112",
    district: "Solapur",
    joined: "27 Feb 2026",
    verified: "Verified",
    status: "Active",
  },
  {
    name: "Annapurna Restaurant",
    role: "Buyer",
    mobile: "99700 11889",
    district: "Solapur",
    joined: "15 Jun 2026",
    verified: "Pending",
    status: "Suspended",
  },
  {
    name: "Vijay Shinde",
    role: "Farmer",
    mobile: "90280 71145",
    district: "Nashik",
    joined: "11 Apr 2026",
    verified: "Verified",
    status: "Active",
  },
  {
    name: "Suresh Jadhav",
    role: "Farmer",
    mobile: "93700 88214",
    district: "Pune",
    joined: "02 May 2026",
    verified: "Verified",
    status: "Active",
  },
  {
    name: "Anita Kale",
    role: "Farmer",
    mobile: "99700 31245",
    district: "Solapur",
    joined: "30 Jun 2026",
    verified: "Verified",
    status: "Active",
  },
];

export const CHART_DATA = {
  queriesByCrop: [
    { name: "Soybean", value: 320 },
    { name: "Cotton", value: 265 },
    { name: "Onion", value: 190 },
    { name: "Sugarcane", value: 148 },
    { name: "Tomato", value: 120 },
    { name: "Wheat", value: 96 },
  ],
  queriesByCategory: [
    { name: "Disease", value: 410 },
    { name: "Pest", value: 305 },
    { name: "Nutrient", value: 220 },
    { name: "Irrigation", value: 130 },
    { name: "Other", value: 74 },
  ],
  monthly: [
    { month: "Mar", queries: 210, resolved: 180, users: 4200, orders: 320, revenue: 182000 },
    { month: "Apr", queries: 265, resolved: 231, users: 5600, orders: 388, revenue: 214000 },
    { month: "May", queries: 320, resolved: 288, users: 7100, orders: 441, revenue: 268000 },
    { month: "Jun", queries: 412, resolved: 366, users: 9200, orders: 520, revenue: 312000 },
    { month: "Jul", queries: 486, resolved: 430, users: 11050, orders: 604, revenue: 358000 },
    { month: "Aug", queries: 528, resolved: 462, users: 12486, orders: 688, revenue: 402000 },
  ],
  districtWise: [
    { name: "Solapur", value: 3120 },
    { name: "Pune", value: 2480 },
    { name: "Nashik", value: 1960 },
    { name: "Satara", value: 1540 },
    { name: "Sangli", value: 1290 },
    { name: "Latur", value: 1096 },
  ],
  responseTime: [
    { month: "Mar", minutes: 34 },
    { month: "Apr", minutes: 30 },
    { month: "May", minutes: 26 },
    { month: "Jun", minutes: 23 },
    { month: "Jul", minutes: 20 },
    { month: "Aug", minutes: 18 },
  ],
  satisfaction: [
    { month: "Mar", score: 4.2 },
    { month: "Apr", score: 4.3 },
    { month: "May", score: 4.5 },
    { month: "Jun", score: 4.6 },
    { month: "Jul", score: 4.7 },
    { month: "Aug", score: 4.8 },
  ],
  topProducts: [
    { name: "Tomato", value: 212 },
    { name: "Onion", value: 186 },
    { name: "Wheat", value: 120 },
    { name: "Green Chilli", value: 98 },
    { name: "Soybean", value: 74 },
  ],
  salesByCategory: [
    { name: "Vegetable", value: 48 },
    { name: "Grain", value: 26 },
    { name: "Commercial Crop", value: 12 },
    { name: "Fruit", value: 9 },
    { name: "Pulse", value: 5 },
  ],
  quantitySold: [
    { month: "Mar", kg: 18400 },
    { month: "Apr", kg: 21200 },
    { month: "May", kg: 24800 },
    { month: "Jun", kg: 27600 },
    { month: "Jul", kg: 30100 },
    { month: "Aug", kg: 33450 },
  ],
};

export interface EnquiryMessage {
  from: "buyer" | "seller";
  text: string;
  time: string;
}

export interface Enquiry {
  id: string;
  buyer: string;
  seller: string;
  product: string;
  productId: string;
  time: string;
  replied: boolean;
  messages: EnquiryMessage[];
}

export const seedEnquiries: Enquiry[] = [
  {
    id: "E1",
    buyer: "Mahesh Traders",
    seller: "Shree Krushi Produce",
    product: "Tomato",
    productId: "P-101",
    time: "1 hour ago",
    replied: false,
    messages: [{ from: "buyer", text: "Is 200 kg Tomato available tomorrow?", time: "1 hour ago" }],
  },
  {
    id: "E2",
    buyer: "Mahesh Traders",
    seller: "Shree Krushi Produce",
    product: "Green Chilli",
    productId: "P-104",
    time: "Yesterday",
    replied: true,
    messages: [
      {
        from: "buyer",
        text: "Is the green chilli really organic? Do you deliver to Station Road?",
        time: "Yesterday",
      },
      {
        from: "seller",
        text: "Yes, it is organically grown. Delivery available in Solapur city before 9 AM.",
        time: "Yesterday",
      },
    ],
  },
  {
    id: "E3",
    buyer: "Patil Agro Buyers",
    seller: "Shree Krushi Produce",
    product: "Soybean",
    productId: "P-105",
    time: "2 days ago",
    replied: true,
    messages: [
      {
        from: "buyer",
        text: "What is the moisture percentage of the FAQ soybean lot?",
        time: "2 days ago",
      },
      {
        from: "seller",
        text: "Moisture is around 10%, cleaned and bagged in 50 kg bags.",
        time: "2 days ago",
      },
    ],
  },
];

export interface Review {
  id: string;
  buyer: string;
  seller: string;
  product: string;
  rating: number;
  quality: number;
  service: number;
  text: string;
  date: string;
}

export const seedReviews: Review[] = [
  {
    id: "R1",
    buyer: "Mahesh Traders",
    seller: "Shree Krushi Produce",
    product: "Tomato",
    rating: 5,
    quality: 5,
    service: 5,
    text: "Tomatoes were fresh and matched the Grade A quality.",
    date: "18 Aug 2026",
  },
  {
    id: "R2",
    buyer: "Patil Agro Buyers",
    seller: "Shree Krushi Produce",
    product: "Soybean",
    rating: 4,
    quality: 4,
    service: 4,
    text: "Soybean quality matched the listed grade.",
    date: "12 Aug 2026",
  },
  {
    id: "R3",
    buyer: "Annapurna Restaurant",
    seller: "Shree Krushi Produce",
    product: "Green Chilli",
    rating: 5,
    quality: 5,
    service: 5,
    text: "Chilli was fresh and delivered early morning as promised.",
    date: "08 Aug 2026",
  },
  {
    id: "R4",
    buyer: "Mahesh Traders",
    seller: "Vijay Produce Company",
    product: "Onion",
    rating: 4,
    quality: 4,
    service: 5,
    text: "Onion sorting was good, a few small pieces in the lot.",
    date: "02 Aug 2026",
  },
];

/** Agricultural produce sellers shown in the Buyer seller directory. */
export interface SellerProfile {
  id: string;
  name: string;
  business: string;
  village: string;
  district: string;
  rating: number;
  crops: string[];
  activeListings: number;
  phone: string;
  verified: boolean;
  about: string;
  image: string;
}

export const SELLER_PROFILES: SellerProfile[] = [
  {
    id: "F1",
    name: "Shree Krushi Produce",
    business: "Shree Krushi Produce",
    village: "Akluj",
    district: "Solapur",
    rating: 4.7,
    crops: ["Tomato", "Green Chilli", "Soybean", "Wheat"],
    activeListings: 4,
    phone: "98220 11223",
    verified: true,
    about:
      "Verified agricultural produce seller supplying graded vegetables and grains to local buyers.",
    image: cropImages.Tomato,
  },
  {
    id: "F2",
    name: "Vijay Produce Company",
    business: "Vijay Produce Company",
    village: "Lasalgaon",
    district: "Nashik",
    rating: 4.5,
    crops: ["Onion", "Grapes"],
    activeListings: 2,
    phone: "90280 71145",
    verified: true,
    about:
      "Verified produce business supplying onions and grapes through Nashik and Lasalgaon markets.",
    image: cropImages.Onion,
  },
  {
    id: "F3",
    name: "Jadhav Fresh Produce",
    business: "Jadhav Fresh Produce",
    village: "Baramati",
    district: "Pune",
    rating: 4.3,
    crops: ["Potato"],
    activeListings: 1,
    phone: "93700 88214",
    verified: true,
    about: "Fresh potato supplier serving retail and hotel buyers around Pune.",
    image: cropImages.Potato,
  },
  {
    id: "F4",
    name: "Kadam Agro Produce",
    business: "Kadam Agro Produce",
    village: "Hatkanangale",
    district: "Kolhapur",
    rating: 4.2,
    crops: ["Sugarcane"],
    activeListings: 1,
    phone: "97640 22118",
    verified: true,
    about: "Commercial crop seller supplying graded Co-86032 sugarcane lots.",
    image: cropImages.Sugarcane,
  },
];

export const BUYER_TYPES = [
  "Individual Buyer",
  "Trader",
  "Wholesaler",
  "Retailer",
  "Restaurant",
  "Institution",
];

export const ACTIVITY_LOG = [
  {
    id: "L1",
    time: "10 minutes ago",
    actor: "Sunita Shinde",
    action: "Submitted query QRY-2026-1044 (Tomato, Pune)",
  },
  {
    id: "L2",
    time: "30 minutes ago",
    actor: "Mahesh Traders",
    action: "Placed order ORD-1001 for 100 kg Tomato worth ₹3,000",
  },
  {
    id: "L3",
    time: "1 hour ago",
    actor: "Dr. S. K. Deshmukh",
    action: "Replied to query QRY-2026-1041 with recommendation",
  },
  {
    id: "L4",
    time: "3 hours ago",
    actor: "Ramesh Patil",
    action: "Updated stock for Green Chilli listing",
  },
  {
    id: "L5",
    time: "Yesterday",
    actor: "Platform Admin",
    action: "Approved buyer account Mahesh Traders",
  },
  {
    id: "L6",
    time: "Yesterday",
    actor: "System",
    action: "Weather advisory broadcast to 4,120 farmers in Solapur",
  },
];

export const FAQS = [
  {
    q: "How do I ask a question to a Krushi Adhikari?",
    a: "Open Ask Question from the sidebar, select your crop, describe the problem and submit.",
  },
  {
    q: "Is the crop diagnosis final?",
    a: "No. Preliminary assessment is only supportive. Final recommendation is given by a verified Krushi Adhikari.",
  },
  {
    q: "How do I change the app language?",
    a: "Use the language selector in the top navigation bar to switch between English, Marathi and Hindi.",
  },
  {
    q: "How do I buy agricultural produce?",
    a: "Open Marketplace, compare the farmer price with the current market price and place your order.",
  },
];

/* ---------------- Krushi Input Store (transactional inputs) ---------------- */

export type InputCategory = "Fertilizer" | "Bio-Pesticide" | "Pesticide" | "Seed" | "Micronutrient";

export interface InputProduct {
  id: string;
  name: string;
  category: InputCategory;
  brand: string;
  packSize: string;
  price: number;
  unit: string;
  kendra: string;
  kendraId: string;
  distance: string;
  stock: number;
  rating: number;
  verified: boolean;
  expertPick: boolean;
  usedFor: string;
  crops: string[];
  dosage: string;
  description: string;
  keywords: string[];
  image: string;
}

export const INPUT_CATEGORIES: InputCategory[] = [
  "Fertilizer",
  "Bio-Pesticide",
  "Pesticide",
  "Seed",
  "Micronutrient",
];

export const INPUT_PRODUCTS: InputProduct[] = [
  {
    id: "IN1",
    name: "Urea 46% N",
    category: "Fertilizer",
    brand: "RCF Suphala",
    packSize: "45 kg bag",
    price: 295,
    unit: "bag",
    kendra: "Shree Krushi Seva Kendra",
    kendraId: "SV1",
    distance: "2.4 km",
    stock: 120,
    rating: 4.6,
    verified: true,
    expertPick: true,
    usedFor: "Nitrogen top dressing at vegetative stage",
    crops: ["Soybean", "Wheat", "Sugarcane"],
    dosage: "50 kg per acre, split in two doses",
    description:
      "Standard nitrogen fertilizer for top dressing. Apply with soil moisture and light irrigation.",
    keywords: ["urea", "nitrogen"],
    image: productImg,
  },
  {
    id: "IN2",
    name: "19:19:19 Water Soluble NPK",
    category: "Fertilizer",
    brand: "Mahadhan",
    packSize: "1 kg pack",
    price: 240,
    unit: "pack",
    kendra: "Krushi Vikas Fertilizer Depot",
    kendraId: "SV4",
    distance: "1.9 km",
    stock: 64,
    rating: 4.5,
    verified: true,
    expertPick: true,
    usedFor: "Foliar spray for uniform growth",
    crops: ["Tomato", "Onion", "Soybean"],
    dosage: "5 g per litre of water, spray at 10 day interval",
    description:
      "Balanced water soluble fertilizer for foliar feeding during flowering and fruiting.",
    keywords: ["19:19:19", "npk", "water soluble"],
    image: productImg,
  },
  {
    id: "IN3",
    name: "Trichoderma Viride Bio-Fungicide",
    category: "Bio-Pesticide",
    brand: "Bio Green",
    packSize: "1 kg pack",
    price: 320,
    unit: "pack",
    kendra: "Agro Pesticide House",
    kendraId: "SV5",
    distance: "4.5 km",
    stock: 38,
    rating: 4.4,
    verified: true,
    expertPick: true,
    usedFor: "Root rot and wilt management",
    crops: ["Soybean", "Tomato", "Chilli"],
    dosage: "2.5 kg per acre mixed with farmyard manure",
    description:
      "Friendly fungus that suppresses soil-borne diseases. Safe for organic cultivation.",
    keywords: ["trichoderma", "bio-fungicide", "wilt"],
    image: productImg,
  },
  {
    id: "IN4",
    name: "Neem Oil 1500 PPM",
    category: "Bio-Pesticide",
    brand: "Nimbus Agro",
    packSize: "1 litre bottle",
    price: 410,
    unit: "bottle",
    kendra: "Agro Pesticide House",
    kendraId: "SV5",
    distance: "4.5 km",
    stock: 52,
    rating: 4.7,
    verified: true,
    expertPick: true,
    usedFor: "Sucking pests, whitefly and mite control",
    crops: ["Cotton", "Tomato", "Onion"],
    dosage: "3 ml per litre of water, spray in evening hours",
    description:
      "Botanical spray for early stage pest pressure. Residue free and pollinator friendly.",
    keywords: ["neem", "azadirachtin", "whitefly"],
    image: productImg,
  },
  {
    id: "IN5",
    name: "Imidacloprid 17.8% SL",
    category: "Pesticide",
    brand: "Krushi Shield",
    packSize: "250 ml bottle",
    price: 385,
    unit: "bottle",
    kendra: "Agro Pesticide House",
    kendraId: "SV5",
    distance: "4.5 km",
    stock: 27,
    rating: 4.2,
    verified: true,
    expertPick: false,
    usedFor: "Aphid, jassid and whitefly control",
    crops: ["Cotton", "Soybean"],
    dosage: "0.5 ml per litre of water",
    description: "Systemic insecticide for sucking pests. Follow the 21 day pre-harvest interval.",
    keywords: ["imidacloprid", "aphid", "jassid"],
    image: productImg,
  },
  {
    id: "IN6",
    name: "Soybean Seed JS-9305",
    category: "Seed",
    brand: "Mahabeej",
    packSize: "30 kg bag",
    price: 2650,
    unit: "bag",
    kendra: "Mahabeej Seed Store",
    kendraId: "SV3",
    distance: "3.8 km",
    stock: 45,
    rating: 4.8,
    verified: true,
    expertPick: true,
    usedFor: "Kharif sowing, 95 to 100 day duration",
    crops: ["Soybean"],
    dosage: "30 kg per acre with seed treatment",
    description: "Certified soybean seed suited to Solapur rainfall pattern with good pod setting.",
    keywords: ["soybean seed", "js-9305"],
    image: productImg,
  },
  {
    id: "IN7",
    name: "Onion Seed Nashik Red",
    category: "Seed",
    brand: "Mahabeej",
    packSize: "1 kg pack",
    price: 1850,
    unit: "pack",
    kendra: "Mahabeej Seed Store",
    kendraId: "SV3",
    distance: "3.8 km",
    stock: 30,
    rating: 4.5,
    verified: true,
    expertPick: false,
    usedFor: "Rabi onion nursery sowing",
    crops: ["Onion"],
    dosage: "3 kg per acre nursery sowing",
    description: "Popular red onion seed with strong storage life and uniform bulb size.",
    keywords: ["onion seed", "nashik red"],
    image: productImg,
  },
  {
    id: "IN8",
    name: "Chelated Zinc EDTA 12%",
    category: "Micronutrient",
    brand: "Suraksha Agro",
    packSize: "500 g pack",
    price: 350,
    unit: "pack",
    kendra: "Shree Krushi Seva Kendra",
    kendraId: "SV1",
    distance: "2.4 km",
    stock: 41,
    rating: 4.3,
    verified: true,
    expertPick: true,
    usedFor: "Yellowing and stunted growth due to zinc deficiency",
    crops: ["Soybean", "Wheat", "Sugarcane"],
    dosage: "1 g per litre of water as foliar spray",
    description: "Corrects zinc deficiency that shows as interveinal yellowing in young leaves.",
    keywords: ["zinc", "micronutrient", "yellow"],
    image: productImg,
  },
  {
    id: "IN9",
    name: "Sulphur 90% WDG",
    category: "Micronutrient",
    brand: "Devi Agro",
    packSize: "5 kg bag",
    price: 480,
    unit: "bag",
    kendra: "Krushi Vikas Fertilizer Depot",
    kendraId: "SV4",
    distance: "1.9 km",
    stock: 22,
    rating: 4.1,
    verified: true,
    expertPick: false,
    usedFor: "Oilseed quality and soil pH correction",
    crops: ["Soybean", "Onion"],
    dosage: "10 kg per acre at sowing",
    description: "Granular sulphur that improves oil content in soybean and bulb quality in onion.",
    keywords: ["sulphur", "sulfur"],
    image: productImg,
  },
];

/** Match a Krushi Adhikari prescription to stocked inputs in the store. */
export function inputsForRecommendation(rec?: Recommendation | null): InputProduct[] {
  if (!rec) return [];
  const text = `${rec.fertilizer} ${rec.pesticide} ${rec.treatment} ${rec.diagnosis}`.toLowerCase();
  const matched = INPUT_PRODUCTS.filter(
    (p) => p.keywords.some((k) => text.includes(k)) || text.includes(p.name.toLowerCase()),
  );
  return matched.length > 0 ? matched : INPUT_PRODUCTS.filter((p) => p.expertPick).slice(0, 3);
}

/* ------------------------------------------------------------------ *
 * Krushi Adhikari certification & verification (shared prototype data)
 * ------------------------------------------------------------------ */

export type CertStatus =
  "Pending Verification" | "Verified" | "Rejected" | "Re-upload Required" | "Expired";

export interface OfficerCertificate {
  id: string;
  type: string;
  name: string;
  number: string;
  authority: string;
  issueDate: string;
  validity: string;
  file: string;
  fileType: "PDF" | "JPG" | "PNG";
  status: CertStatus;
  adminNote?: string;
  uploadedAt: string;
  required: boolean;
}

export interface OfficerActivity {
  date: string;
  text: string;
}

export interface OfficerRecord {
  id: string;
  name: string;
  initials: string;
  mobile: string;
  email: string;
  district: string;
  taluka: string;
  state: string;
  address: string;
  designation: string;
  department: string;
  officerId: string;
  qualification: string;
  specialization: string;
  experience: string;
  joiningDate: string;
  office: string;
  registrationNo: string;
  status: "Active" | "Suspended";
  suspendReason?: string;
  accountVerified: boolean;
  certificates: OfficerCertificate[];
  activity: OfficerActivity[];
  adminNote: string;
  lastReviewedBy?: string;
  lastReviewedOn?: string;
}

export const REQUIRED_CERT_TYPES = [
  "Degree Certificate",
  "Appointment Certificate",
  "Officer ID / Professional Registration",
];

/** Verification badge derived from the certificate statuses + admin approval. */
export function officerVerification(
  o: OfficerRecord,
): "Verified" | "Pending Verification" | "Action Required" {
  if (o.accountVerified) return "Verified";
  const bad = o.certificates.some(
    (c) => c.status === "Rejected" || c.status === "Re-upload Required" || c.status === "Expired",
  );
  return bad ? "Action Required" : "Pending Verification";
}

export function requiredCertsVerified(o: OfficerRecord) {
  return REQUIRED_CERT_TYPES.every((type) =>
    o.certificates.some((c) => c.type === type && c.status === "Verified"),
  );
}

export function certProgress(o: OfficerRecord) {
  const required = o.certificates.filter((c) => c.required);
  return {
    uploaded: required.length,
    requiredTotal: REQUIRED_CERT_TYPES.length,
    verified: o.certificates.filter((c) => c.status === "Verified").length,
    total: o.certificates.length,
  };
}

export const seedOfficers: OfficerRecord[] = [
  {
    id: "OF1",
    name: "Dr. S. K. Deshmukh",
    initials: "SD",
    mobile: "94220 88110",
    email: "skdeshmukh@agri.gov.in",
    district: "Solapur",
    taluka: "Malshiras",
    state: "Maharashtra",
    address: "District Agriculture Office, Station Road, Solapur 413001",
    designation: "Agriculture Officer",
    department: "Department of Agriculture, Maharashtra",
    officerId: "KA-SOL-1024",
    qualification: "M.Sc. Agriculture",
    specialization: "Soybean, Cotton & Pulses",
    experience: "8 Years",
    joiningDate: "08 Jan 2026",
    office: "District Agriculture Office, Solapur",
    registrationNo: "MAH-AGRI-REG-55821",
    status: "Active",
    accountVerified: false,
    adminNote: "",
    lastReviewedBy: "Platform Admin",
    lastReviewedOn: "10 Sep 2026",
    certificates: [
      {
        id: "OF1-C1",
        type: "Degree Certificate",
        name: "M.Sc. Agriculture Degree Certificate",
        number: "AGRI-MSC-2016-4281",
        authority: "Mahatma Phule Krishi Vidyapeeth",
        issueDate: "15 Jun 2016",
        validity: "Lifetime",
        file: "msc-agriculture-degree.pdf",
        fileType: "PDF",
        status: "Verified",
        uploadedAt: "08 Jan 2026",
        required: true,
      },
      {
        id: "OF1-C2",
        type: "Appointment Certificate",
        name: "Agriculture Officer Appointment Certificate",
        number: "DOA-MH-SOL-2018-772",
        authority: "Department of Agriculture, Maharashtra",
        issueDate: "02 Jul 2018",
        validity: "Active",
        file: "appointment-letter.pdf",
        fileType: "PDF",
        status: "Verified",
        uploadedAt: "08 Jan 2026",
        required: true,
      },
      {
        id: "OF1-C3",
        type: "Officer ID / Professional Registration",
        name: "Professional Registration / Officer ID",
        number: "MAH-AGRI-REG-55821",
        authority: "Maharashtra Agriculture Department",
        issueDate: "10 Aug 2018",
        validity: "10 Aug 2028",
        file: "officer-id-card.jpg",
        fileType: "JPG",
        status: "Verified",
        uploadedAt: "08 Jan 2026",
        required: true,
      },
      {
        id: "OF1-C4",
        type: "Experience Certificate",
        name: "Experience Certificate",
        number: "EXP-SOL-2026-112",
        authority: "District Agriculture Office, Solapur",
        issueDate: "05 Jan 2026",
        validity: "Lifetime",
        file: "experience-certificate.pdf",
        fileType: "PDF",
        status: "Pending Verification",
        uploadedAt: "09 Sep 2026",
        required: false,
      },
    ],
    activity: [
      { date: "10 Sep 2026", text: "Degree Certificate verified by Platform Admin." },
      { date: "09 Sep 2026", text: "Experience Certificate uploaded." },
      { date: "22 Aug 2026", text: "Responded to query QRY-2026-1041 (Soybean)." },
      { date: "08 Jan 2026", text: "Krushi Adhikari account created." },
    ],
  },
  {
    id: "OF2",
    name: "Dr. A. R. Jadhav",
    initials: "AJ",
    mobile: "94033 55221",
    email: "arjadhav@agri.gov.in",
    district: "Sangli",
    taluka: "Miraj",
    state: "Maharashtra",
    address: "Taluka Agriculture Office, Miraj, Sangli 416410",
    designation: "Taluka Agriculture Officer",
    department: "Krushi Vibhag, Sangli",
    officerId: "KA-SAN-2087",
    qualification: "B.Sc. Agriculture, PG Diploma in Plant Protection",
    specialization: "Grapes, Sugarcane & Horticulture",
    experience: "6 Years",
    joiningDate: "18 Feb 2026",
    office: "Taluka Agriculture Office, Miraj",
    registrationNo: "MAH-AGRI-REG-61204",
    status: "Active",
    accountVerified: false,
    adminNote: "",
    certificates: [
      {
        id: "OF2-C1",
        type: "Degree Certificate",
        name: "B.Sc. Agriculture Degree Certificate",
        number: "AGRI-BSC-2018-9910",
        authority: "Mahatma Phule Krishi Vidyapeeth",
        issueDate: "20 Jun 2018",
        validity: "Lifetime",
        file: "bsc-agriculture-degree.pdf",
        fileType: "PDF",
        status: "Verified",
        uploadedAt: "18 Feb 2026",
        required: true,
      },
      {
        id: "OF2-C2",
        type: "Appointment Certificate",
        name: "Taluka Agriculture Officer Appointment Certificate",
        number: "DOA-MH-SAN-2020-431",
        authority: "Department of Agriculture, Maharashtra",
        issueDate: "11 Mar 2020",
        validity: "Active",
        file: "appointment-order.pdf",
        fileType: "PDF",
        status: "Verified",
        uploadedAt: "18 Feb 2026",
        required: true,
      },
      {
        id: "OF2-C3",
        type: "Officer ID / Professional Registration",
        name: "Officer ID Card",
        number: "MAH-AGRI-REG-61204",
        authority: "Maharashtra Agriculture Department",
        issueDate: "11 Mar 2020",
        validity: "11 Mar 2030",
        file: "officer-id.png",
        fileType: "PNG",
        status: "Pending Verification",
        uploadedAt: "10 Sep 2026",
        required: true,
      },
    ],
    activity: [
      { date: "10 Sep 2026", text: "Officer ID Card uploaded." },
      { date: "18 Feb 2026", text: "Krushi Adhikari account created." },
    ],
  },
  {
    id: "OF3",
    name: "Dr. P. M. Kulkarni",
    initials: "PK",
    mobile: "98604 21178",
    email: "pmkulkarni@agri.gov.in",
    district: "Nashik",
    taluka: "Dindori",
    state: "Maharashtra",
    address: "Taluka Agriculture Office, Dindori, Nashik 422202",
    designation: "Agriculture Officer",
    department: "Department of Agriculture, Maharashtra",
    officerId: "MH-AGRI-4471",
    qualification: "M.Sc. Horticulture",
    specialization: "Horticulture & Pest Management",
    experience: "8 Years",
    joiningDate: "19 Aug 2026",
    office: "Taluka Agriculture Office, Dindori",
    registrationNo: "MAH-AGRI-REG-70112",
    status: "Active",
    accountVerified: false,
    adminNote: "",
    certificates: [
      {
        id: "OF3-C1",
        type: "Degree Certificate",
        name: "M.Sc. Horticulture Degree Certificate",
        number: "AGRI-MSC-2015-3320",
        authority: "Dr. Balasaheb Sawant Konkan Krishi Vidyapeeth",
        issueDate: "12 Jul 2015",
        validity: "Lifetime",
        file: "msc-horticulture-degree.pdf",
        fileType: "PDF",
        status: "Pending Verification",
        uploadedAt: "19 Aug 2026",
        required: true,
      },
      {
        id: "OF3-C2",
        type: "Appointment Certificate",
        name: "Agriculture Officer Appointment Certificate",
        number: "DOA-MH-NAS-2017-118",
        authority: "Department of Agriculture, Maharashtra",
        issueDate: "05 Sep 2017",
        validity: "Active",
        file: "appointment-letter.pdf",
        fileType: "PDF",
        status: "Pending Verification",
        uploadedAt: "19 Aug 2026",
        required: true,
      },
      {
        id: "OF3-C3",
        type: "Officer ID / Professional Registration",
        name: "Officer ID Certificate",
        number: "MAH-AGRI-REG-70112",
        authority: "Maharashtra Agriculture Department",
        issueDate: "05 Sep 2017",
        validity: "05 Sep 2027",
        file: "officer-id-certificate.pdf",
        fileType: "PDF",
        status: "Pending Verification",
        uploadedAt: "19 Aug 2026",
        required: true,
      },
    ],
    activity: [{ date: "19 Aug 2026", text: "Registration submitted with 3 certificates." }],
  },
  {
    id: "OF4",
    name: "Smt. R. B. Pawar",
    initials: "RP",
    mobile: "98812 40033",
    email: "rbpawar@agri.gov.in",
    district: "Latur",
    taluka: "Ausa",
    state: "Maharashtra",
    address: "Krushi Vibhag Office, Ausa, Latur 413520",
    designation: "Taluka Agriculture Officer",
    department: "Krushi Vibhag, Latur",
    officerId: "MH-AGRI-5120",
    qualification: "B.Sc. Agriculture",
    specialization: "Soil Health & Dryland Farming",
    experience: "5 Years",
    joiningDate: "20 Aug 2026",
    office: "Krushi Vibhag Office, Ausa",
    registrationNo: "MAH-AGRI-REG-73341",
    status: "Active",
    accountVerified: false,
    adminNote: "",
    certificates: [
      {
        id: "OF4-C1",
        type: "Degree Certificate",
        name: "B.Sc. Agriculture Degree Certificate",
        number: "AGRI-BSC-2019-5521",
        authority: "Vasantrao Naik Marathwada Krishi Vidyapeeth",
        issueDate: "28 Jun 2019",
        validity: "Lifetime",
        file: "degree-certificate.jpg",
        fileType: "JPG",
        status: "Re-upload Required",
        adminNote: "Uploaded scan is blurred. Please upload a clear PDF or image.",
        uploadedAt: "20 Aug 2026",
        required: true,
      },
      {
        id: "OF4-C2",
        type: "Appointment Certificate",
        name: "Appointment Letter",
        number: "DOA-MH-LAT-2021-655",
        authority: "Krushi Vibhag, Latur",
        issueDate: "14 Jan 2021",
        validity: "Active",
        file: "appointment-letter.pdf",
        fileType: "PDF",
        status: "Verified",
        uploadedAt: "20 Aug 2026",
        required: true,
      },
      {
        id: "OF4-C3",
        type: "Officer ID / Professional Registration",
        name: "Officer ID Card",
        number: "MAH-AGRI-REG-73341",
        authority: "Maharashtra Agriculture Department",
        issueDate: "14 Jan 2021",
        validity: "14 Jan 2031",
        file: "officer-id.png",
        fileType: "PNG",
        status: "Pending Verification",
        uploadedAt: "20 Aug 2026",
        required: true,
      },
    ],
    activity: [
      { date: "21 Aug 2026", text: "Re-upload requested for Degree Certificate." },
      { date: "20 Aug 2026", text: "Registration submitted with 3 certificates." },
    ],
  },
  {
    id: "OF5",
    name: "Shri. N. D. Salunkhe",
    initials: "NS",
    mobile: "97300 55418",
    email: "ndsalunkhe@agri.gov.in",
    district: "Kolhapur",
    taluka: "Hatkanangale",
    state: "Maharashtra",
    address: "Krushi Vibhag Office, Hatkanangale, Kolhapur 416109",
    designation: "Agriculture Assistant",
    department: "Krushi Vibhag, Kolhapur",
    officerId: "MH-AGRI-3390",
    qualification: "B.Sc. Agriculture",
    specialization: "Sugarcane Agronomy",
    experience: "11 Years",
    joiningDate: "21 Aug 2026",
    office: "Krushi Vibhag Office, Hatkanangale",
    registrationNo: "MAH-AGRI-REG-64887",
    status: "Active",
    accountVerified: false,
    adminNote: "",
    certificates: [
      {
        id: "OF5-C1",
        type: "Degree Certificate",
        name: "B.Sc. Agriculture Degree Certificate",
        number: "AGRI-BSC-2013-2210",
        authority: "Mahatma Phule Krishi Vidyapeeth",
        issueDate: "30 Jun 2013",
        validity: "Lifetime",
        file: "degree-certificate.pdf",
        fileType: "PDF",
        status: "Verified",
        uploadedAt: "21 Aug 2026",
        required: true,
      },
      {
        id: "OF5-C2",
        type: "Appointment Certificate",
        name: "Appointment Certificate",
        number: "DOA-MH-KOL-2015-208",
        authority: "Krushi Vibhag, Kolhapur",
        issueDate: "08 Feb 2015",
        validity: "Active",
        file: "appointment-certificate.pdf",
        fileType: "PDF",
        status: "Pending Verification",
        uploadedAt: "21 Aug 2026",
        required: true,
      },
      {
        id: "OF5-C3",
        type: "Officer ID / Professional Registration",
        name: "Officer ID Card",
        number: "MAH-AGRI-REG-64887",
        authority: "Maharashtra Agriculture Department",
        issueDate: "08 Feb 2015",
        validity: "08 Feb 2025",
        file: "officer-id.jpg",
        fileType: "JPG",
        status: "Expired",
        adminNote: "Officer ID validity lapsed on 08 Feb 2025. Please submit the renewed card.",
        uploadedAt: "21 Aug 2026",
        required: true,
      },
      {
        id: "OF5-C4",
        type: "Experience Certificate",
        name: "Experience Certificate",
        number: "EXP-KOL-2026-77",
        authority: "District Agriculture Office, Kolhapur",
        issueDate: "02 Aug 2026",
        validity: "Lifetime",
        file: "experience-certificate.pdf",
        fileType: "PDF",
        status: "Verified",
        uploadedAt: "21 Aug 2026",
        required: false,
      },
    ],
    activity: [{ date: "21 Aug 2026", text: "Registration submitted with 4 certificates." }],
  },
];

export const CERT_TYPES = [
  "Degree Certificate",
  "Appointment Certificate",
  "Officer ID / Professional Registration",
  "Experience Certificate",
  "Government Department Identity / Authorization",
  "Other Supporting Certificate",
];

export const REJECT_REASONS = [
  "Document unclear",
  "Certificate number not readable",
  "Invalid document",
  "Details do not match profile",
  "Expired certificate",
  "Other",
];

export const SUSPEND_REASONS = [
  "Invalid credentials",
  "Policy violation",
  "Expired authorization",
  "Suspicious account",
  "Other",
];
