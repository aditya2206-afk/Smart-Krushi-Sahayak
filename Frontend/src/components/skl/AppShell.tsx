import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  ChevronDown,
  LifeBuoy,
  LogOut,
  Menu,
  Search,
  Heart,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/skl/store";
import { MOBILE_NAV, NAV, SEARCH_INDEX } from "@/lib/skl/nav";
import type { Role } from "@/lib/skl/data";
import { LanguageSelector, Logo } from "./common";
import { Chatbot } from "./Chatbot";
import { t } from "@/lib/skl/i18n";

function useCurrentPath() {
  return useRouterState({
    select: (s) => s.location.pathname.replace(/^\/app\//, "").replace(/\/$/, ""),
  });
}

function SidebarNav({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const current = useCurrentPath();
  const items = NAV[role];
  return (
    <nav className="space-y-0.5 px-3 pb-4">
      {items.map((item) => {
        const active = current === item.path;
        return (
          <Link
            key={item.path}
            to="/app/$"
            params={{ _splat: item.path }}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-pale text-forest shadow-[inset_3px_0_0_var(--color-primary)]"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className={cn("size-[18px] shrink-0", active && "text-primary")} />
            <span className="truncate">{t(item.label)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SupportCard() {
  return (
    <div className="mx-3 mb-4 rounded-2xl bg-pale p-4">
      <div className="flex items-center gap-2 text-forest">
        <LifeBuoy className="size-4" />
        <p className="text-sm font-semibold">{t("Need Help?")}</p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {t(
          "Our support team assists in English, \u092e\u0930\u093e\u0920\u0940 and \u0939\u093f\u0902\u0926\u0940.",
        )}
      </p>
      <Button
        size="sm"
        className="mt-3 w-full"
        onClick={() => alert("Support: 1800-233-4000 (Toll Free)")}
      >
        {t("Contact Support")}
      </Button>
    </div>
  );
}

function GlobalSearch() {
  const [q, setQ] = useState("");
  const results = q
    ? SEARCH_INDEX.filter((s) => s.label.toLowerCase().includes(q.toLowerCase())).slice(0, 6)
    : [];
  return (
    <div className="relative hidden max-w-md flex-1 md:block">
      <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("Search schemes, produce, queries, articles...")}
        aria-label={t("Global search")}
        className="rounded-full pl-9"
      />
      {results.length > 0 && (
        <div className="absolute top-11 left-0 z-50 w-full overflow-hidden rounded-xl border bg-popover shadow-lift">
          {results.map((r) => (
            <Link
              key={t(r.label)}
              to="/app/$"
              params={{ _splat: r.path }}
              onClick={() => setQ("")}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-muted"
            >
              <r.icon className="size-4 text-primary" />
              <span className="flex-1 truncate">{t(r.label)}</span>
              <Badge variant="secondary" className="text-[10px]">
                {r.kind}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { role, user, notifications, unread, markAllRead, logout, savedListings } =
    useStore();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const current = useCurrentPath();
  if (!role || !user) return null;
  const roleNotifs = notifications.filter((n) => n.role === role).slice(0, 6);

  const doLogout = () => {
    // Clears authToken + authUser, then lands on Login.
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[17rem] border-r bg-sidebar lg:flex lg:flex-col">
        <div className="px-4 py-4">
          <Logo />
        </div>
        <ScrollArea className="flex-1">
          <SidebarNav role={role} />
        </ScrollArea>
        <SupportCard />
        <div className="border-t px-3 py-3">
          <button
            onClick={doLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-[18px]" /> {t("Logout")}
          </button>
        </div>
      </aside>

      <div className="lg:pl-[17rem]">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur">
          <Sheet open={openMenu} onOpenChange={setOpenMenu}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t("Open menu")}>
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[17rem] p-0">
              <SheetTitle className="sr-only">{t("Navigation")}</SheetTitle>
              <div className="px-4 py-4">
                <Logo />
              </div>
              <ScrollArea className="h-[calc(100vh-9rem)]">
                <SidebarNav role={role} onNavigate={() => setOpenMenu(false)} />
                <SupportCard />
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <div className="lg:hidden">
            <Logo compact />
          </div>

          <GlobalSearch />

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            {role === "buyer" && (
              <Link to="/app/$" params={{ _splat: "buyer/saved" }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  aria-label={t("Saved Products")}
                >
                  <Heart className="size-5" />
                  {savedListings.length > 0 && (
                    <span className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-harvest text-[10px] font-bold text-foreground">
                      {savedListings.length}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  aria-label={t("Notifications")}
                >
                  <Bell className="size-5" />
                  {unread(role) > 0 && (
                    <span className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                      {unread(role)}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <DropdownMenuLabel className="p-0">{t("Notifications")}</DropdownMenuLabel>
                  <button className="text-xs text-primary" onClick={() => markAllRead(role)}>
                    {t("Mark all as read")}
                  </button>
                </div>
                <DropdownMenuSeparator />
                {roleNotifs.length === 0 && (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                    {t("No notifications")}
                  </p>
                )}
                {roleNotifs.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    onClick={() =>
                      navigate({ to: "/app/$", params: { _splat: `${role}/notifications` } })
                    }
                    className="flex flex-col items-start gap-0.5 py-2"
                  >
                    <div className="flex w-full items-center gap-2">
                      {!n.read && <span className="size-1.5 rounded-full bg-primary" />}
                      <span className="text-sm font-medium">{t(n.title)}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground">{n.time}</span>
                    </div>
                    <span className="line-clamp-2 text-xs text-muted-foreground">{t(n.body)}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-1.5 sm:px-2">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-pale text-xs font-semibold text-forest">
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block text-xs font-semibold">{user.name}</span>
                    <span className="block text-[10px] text-muted-foreground">
                      {user.subtitle}
                    </span>
                  </span>
                  <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="leading-tight">
                  {user.name}
                  <span className="block text-[11px] font-normal text-muted-foreground">
                    {user.meta}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate({ to: "/app/$", params: { _splat: `${role}/profile` } })}
                >
                  <UserCircle className="size-4" /> {t("Profile")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={doLogout} className="text-destructive">
                  <LogOut className="size-4" /> {t("Logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto max-w-[100rem] px-4 pt-6 pb-28 sm:px-6 lg:pb-10">{children}</main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-card/95 backdrop-blur lg:hidden">
        {MOBILE_NAV[role].map((item) => {
          const active = current === item.path;
          return (
            <Link
              key={item.path}
              to="/app/$"
              params={{ _splat: item.path }}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="size-5" />
              {t(item.label)}
            </Link>
          );
        })}
      </nav>

      <Chatbot />
    </div>
  );
}
