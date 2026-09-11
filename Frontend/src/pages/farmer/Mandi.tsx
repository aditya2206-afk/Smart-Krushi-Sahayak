import { useState } from "react";
import { Search, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, PageHeader, SectionCard, TrendBadge } from "@/components/skl/common";
import { inr } from "@/lib/skl/store";
import { MARKET_PRICE_BOARD, MARKETS } from "@/lib/skl/data";
import { t } from "@/lib/skl/i18n";

export function MandiPricesPage() {
  const [q, setQ] = useState("");
  const [market, setMarket] = useState("All");

  const rows = MARKET_PRICE_BOARD.filter(
    (m) =>
      (market === "All" || m.market === market) &&
      `${m.product} ${m.district}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title={t("Today's Mandi Prices")}
        subtitle={t(
          "Live market rates from nearby mandis. Informational only — no buying or selling here.",
        )}
        breadcrumb={["Dashboard", "Today's Mandi Prices"]}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {MARKET_PRICE_BOARD.filter((m) =>
          ["Soybean", "Wheat", "Sugarcane"].includes(m.product),
        ).map((m) => (
          <Card key={m.id} className="gap-0 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{t(m.product)}</p>
                <p className="text-xs text-muted-foreground">{m.market}</p>
              </div>
              <TrendBadge
                trend={m.change > 0 ? "Up" : m.change < 0 ? "Down" : "Stable"}
                change={m.change}
              />
            </div>
            <p className="mt-3 text-2xl font-bold text-forest">
              {inr(m.avg)}
              <span className="text-xs font-normal text-muted-foreground">/{t(m.unit)}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("Range")}: {inr(m.min)} – {inr(m.max)} • {m.updated}
            </p>
          </Card>
        ))}
      </div>

      <Card className="mt-4 mb-4 gap-0 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("Search crop or district")}
              className="pl-9"
            />
          </div>
          <Select value={market} onValueChange={setMarket}>
            <SelectTrigger className="sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">{t("All Markets")}</SelectItem>
              {MARKETS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <SectionCard
        title={t("Mandi Live Rates")}
        desc={t("Minimum, maximum and average rates updated through the day.")}
      >
        {rows.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title={t("No rates found")}
            desc={t("Try another market or keyword.")}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Crop")}</TableHead>
                  <TableHead>{t("Market")}</TableHead>
                  <TableHead>{t("Min")}</TableHead>
                  <TableHead>{t("Max")}</TableHead>
                  <TableHead>{t("Average")}</TableHead>
                  <TableHead>{t("Change")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">
                      {t(m.product)}
                      <span className="block text-xs text-muted-foreground">{m.district}</span>
                    </TableCell>
                    <TableCell>{m.market}</TableCell>
                    <TableCell>{inr(m.min)}</TableCell>
                    <TableCell>{inr(m.max)}</TableCell>
                    <TableCell className="font-semibold text-forest">
                      {inr(m.avg)}/{t(m.unit)}
                    </TableCell>
                    <TableCell>
                      <TrendBadge
                        trend={m.change > 0 ? "Up" : m.change < 0 ? "Down" : "Stable"}
                        change={m.change}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>
    </>
  );
}
