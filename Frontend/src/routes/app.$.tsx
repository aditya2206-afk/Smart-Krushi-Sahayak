import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/skl/AppShell";
import { useStore } from "@/lib/skl/store";
import type { Role } from "@/lib/skl/data";

import { FarmerDashboard } from "@/pages/farmer/Dashboard";
import { AskQuestionPage, DiagnosePage } from "@/pages/farmer/Ask";
import { MyQuestionsPage } from "@/pages/farmer/Questions";
import { MyCropsPage } from "@/pages/farmer/Crops";
import { MandiPricesPage } from "@/pages/farmer/Mandi";
import { SchemesPage, ServicesPage } from "@/pages/farmer/Schemes";
import { ChatPage } from "@/pages/Chat";
import {
  FertilizersPage,
  LibraryPage,
  NotificationsPage,
  PesticidesPage,
  SettingsPage,
  WeatherPage,
} from "@/pages/shared";
import { ProfilePage } from "@/pages/ProfilePage";
import {
  DiseasesPage,
  OfficerCropsPage,
  OfficerDashboard,
  OfficerFarmersPage,
  OfficerQueriesPage,
  OfficerReportsPage,
} from "@/pages/officer";
import { OfficerCertificationsPage } from "@/pages/officer/Certifications";
import { AdminOfficersPage, OfficerDetailPage } from "@/pages/admin/Officers";
import {
  AddProductPage,
  EarningsPage,
  EnquiriesPage,
  InventoryPage,
  MyBuyersPage,
  ProduceDashboard,
  ProduceOrdersPage,
  ReviewsPage,
} from "@/pages/produce";
import {
  BuyerDashboard,
  BuyerSellerDetail,
  BuyerSellersPage,
  BuyerMarketPricesPage,
  BuyerMarketplace,
  BuyerMessagesPage,
  BuyerOrdersPage,
  BuyerProductDetail,
  SavedProductsPage,
} from "@/pages/buyer";
import {
  AdminActivityPage,
  AdminContentPage,
  AdminDashboard,
  AdminOrdersPage,
  AdminProductsPage,
  AdminQueriesPage,
  AdminReportsPage,
  AdminSchemesPage,
  AdminServicesPage,
  AdminUsersPage,
  ApprovalsPage,
} from "@/pages/admin";
import { t } from "@/lib/skl/i18n";

export const Route = createFileRoute("/app/$")({
  head: () => ({
    meta: [
      { title: "Dashboard — Smart Krushi Sahayak" },
      {
        name: "description",
        content:
          "Farmer, Krushi Adhikari, seller and admin dashboards for crop consultation, marketplace orders and schemes.",
      },
      { property: "og:title", content: "Dashboard — Smart Krushi Sahayak" },
      {
        property: "og:description",
        content:
          "Manage crop queries, expert advice, marketplace orders and government schemes in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { filter?: string; use?: string } => ({
    ...(typeof search["filter"] === "string" ? { filter: search["filter"] } : {}),
    ...(typeof search["use"] === "string" ? { use: search["use"] } : {}),
  }),
  component: AppSplat,
});

function AppSplat() {
  const { _splat } = Route.useParams();
  const { role, authUser, authChecked, refreshSession } = useStore();
  const path = (_splat ?? "").replace(/^\/+|\/+$/g, "");
  const [verifying, setVerifying] = useState(true);
  const refreshRef = useRef(refreshSession);
  refreshRef.current = refreshSession;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await refreshRef.current();
      if (!cancelled) setVerifying(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!authChecked || verifying) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">{t("Loading your dashboard...")}</p>
        </div>
      </div>
    );
  }

  // No valid backend session: token missing/invalid/expired was cleared by verify.
  if (!role || !authUser) return <Navigate to="/login" />;

  const [seg = role, page = "dashboard", sub] = path.split("/");
  // Role-based frontend routing: a user may only open their own role's section.
  if (seg !== role) {
    return <Navigate to="/app/$" params={{ _splat: `${role}/dashboard` }} />;
  }
  const activeRole = role as Role;

  return <AppShell>{renderPage(activeRole, page, sub)}</AppShell>;
}

function renderPage(role: Role, page: string, sub?: string) {
  if (page === "notifications") return <NotificationsPage role={role} />;
  if (page === "settings") return <SettingsPage />;
  if (page === "profile") return <ProfilePage role={role} />;
  if (page === "library") return <LibraryPage />;
  if (page === "weather") return <WeatherPage />;
  if (page === "pesticides") return <PesticidesPage />;
  if (page === "fertilizers") return <FertilizersPage />;

  if (role === "farmer") {
    switch (page) {
      case "ask":
        return <AskQuestionPage />;
      case "questions":
        return <MyQuestionsPage />;
      case "chat":
        return <ChatPage as="farmer" />;
      case "diagnose":
        return <DiagnosePage />;
      case "crops":
        return <MyCropsPage />;
      case "mandi-prices":
        return <MandiPricesPage />;
      case "schemes":
        return <SchemesPage />;
      case "services":
        return <ServicesPage />;
      default:
        return <FarmerDashboard />;
    }
  }

  if (role === "seller") {
    switch (page) {
      case "add-product":
        return <AddProductPage />;
      case "listings":
      case "inventory":
        return <InventoryPage />;
      case "orders":
        return <ProduceOrdersPage />;
      case "enquiries":
        return <EnquiriesPage />;
      case "buyers":
        return <MyBuyersPage />;
      case "analytics":
        return <EarningsPage />;
      case "reviews":
        return <ReviewsPage />;
      case "market-prices":
        return <BuyerMarketPricesPage />;
      default:
        return <ProduceDashboard />;
    }
  }

  if (role === "buyer") {
    switch (page) {
      case "marketplace":
        return sub ? <BuyerProductDetail productId={sub} /> : <BuyerMarketplace />;
      case "market-prices":
        return <BuyerMarketPricesPage />;
      case "orders":
        return sub ? <BuyerOrdersPage orderId={sub} /> : <BuyerOrdersPage />;
      case "saved":
        return <SavedProductsPage />;
      case "sellers":
        return sub ? <BuyerSellerDetail sellerId={sub} /> : <BuyerSellersPage />;
      case "messages":
        return <BuyerMessagesPage />;
      default:
        return <BuyerDashboard />;
    }
  }

  if (role === "officer") {
    switch (page) {
      case "certifications":
        return <OfficerCertificationsPage />;
      case "queries":
        return <OfficerQueriesPage />;
      case "pending":
        return <OfficerQueriesPage initialStatus="Pending" />;
      case "assigned":
        return <OfficerQueriesPage mine />;
      case "chat":
        return <ChatPage as="officer" />;
      case "crops":
        return <OfficerCropsPage />;
      case "diseases":
        return <DiseasesPage />;
      case "reports":
        return <OfficerReportsPage />;
      case "farmers":
        return <OfficerFarmersPage />;
      default:
        return <OfficerDashboard />;
    }
  }

  switch (page) {
    case "users":
      return <AdminUsersPage />;
    case "farmers":
      return <AdminUsersPage filter="Farmer" />;
    case "sellers":
      return <AdminUsersPage filter="Seller" />;
    case "officers":
      return sub ? <OfficerDetailPage officerId={sub} /> : <AdminOfficersPage />;
    case "buyers":
      return <AdminUsersPage filter="Buyer" />;
    case "approvals":
      return <ApprovalsPage />;
    case "queries":
      return <AdminQueriesPage />;
    case "products":
      return <AdminProductsPage />;
    case "orders":
      return <AdminOrdersPage />;
    case "schemes":
      return <AdminSchemesPage />;
    case "services":
      return <AdminServicesPage />;
    case "content":
      return <AdminContentPage />;
    case "reports":
      return <AdminReportsPage />;
    case "activity":
      return <AdminActivityPage />;
    default:
      return <AdminDashboard />;
  }
}
