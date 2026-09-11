import { useState } from "react";
import { CalendarDays, Droplets, Plus, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { PageHeader, SectionCard, StatusBadge } from "@/components/skl/common";
import { CROPS, CROP_CARDS, cropImages } from "@/lib/skl/data";
import { t } from "@/lib/skl/i18n";

type Crop = (typeof CROP_CARDS)[number];

export function MyCropsPage() {
  const [crops, setCrops] = useState<Crop[]>(CROP_CARDS);
  const [detail, setDetail] = useState<Crop | null>(null);
  const [add, setAdd] = useState(false);
  const [form, setForm] = useState({ name: "Wheat", area: "", sowing: "", variety: "" });

  return (
    <>
      <PageHeader
        title={t("My Crops")}
        subtitle={t("Track area, sowing dates and health status of every plot.")}
        breadcrumb={["Dashboard", "My Crops"]}
        action={
          <Dialog open={add} onOpenChange={setAdd}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="size-4" /> {t("Add Crop")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("Add Crop")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>{t("Crop")}</Label>
                  <Select value={form.name} onValueChange={(v) => setForm({ ...form, name: v })}>
                    <SelectTrigger className="mt-1.5 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CROPS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Area (acres)</Label>
                  <Input
                    className="mt-1.5"
                    value={form.area}
                    maxLength={10}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    placeholder="2"
                  />
                </div>
                <div>
                  <Label>{t("Sowing Date")}</Label>
                  <Input
                    className="mt-1.5"
                    value={form.sowing}
                    maxLength={20}
                    onChange={(e) => setForm({ ...form, sowing: e.target.value })}
                    placeholder={t("15 June 2026")}
                  />
                </div>
                <div>
                  <Label>{t("Variety")}</Label>
                  <Input
                    className="mt-1.5"
                    value={form.variety}
                    maxLength={40}
                    onChange={(e) => setForm({ ...form, variety: e.target.value })}
                    placeholder={t("Lok-1")}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    if (!form.area || !form.sowing) {
                      toast.error("Enter area and sowing date");
                      return;
                    }
                    setCrops([
                      ...crops,
                      {
                        id: `CR${crops.length + 1}`,
                        name: form.name,
                        area: `${form.area} Acres`,
                        sowing: form.sowing,
                        status: "Healthy",
                        image: cropImages.Soybean,
                        variety: form.variety || "Local",
                        irrigation: "Drip",
                      },
                    ]);
                    setAdd(false);
                    setForm({ name: "Wheat", area: "", sowing: "", variety: "" });
                    toast.success("Crop added to your farm profile");
                  }}
                >
                  {t("Save Crop")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {crops.map((c) => (
          <Card key={c.id} className="hover-lift gap-0 overflow-hidden p-0">
            <img
              src={c.image}
              alt={c.name}
              loading="lazy"
              width={800}
              height={600}
              className="h-40 w-full object-cover"
            />
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{c.name}</h3>
                <StatusBadge status={c.status} />
              </div>
              <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                <p>
                  <Sprout className="mr-1.5 inline size-3.5 text-primary" />
                  Area: {c.area}
                </p>
                <p>
                  <CalendarDays className="mr-1.5 inline size-3.5 text-primary" />
                  Sowing Date: {c.sowing}
                </p>
                <p>
                  <Droplets className="mr-1.5 inline size-3.5 text-primary" />
                  Irrigation: {c.irrigation}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() => setDetail(c)}
              >
                {t("View Details")}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <SectionCard title={t("Season Summary")} className="mt-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Total Area", `${crops.reduce((a, c) => a + parseFloat(c.area), 0)} Acres`],
            [
              "Healthy Plots",
              `${crops.filter((c) => c.status === "Healthy").length} of ${crops.length}`,
            ],
            ["Needs Attention", `${crops.filter((c) => c.status !== "Healthy").length}`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-pale/60 p-4">
              <p className="text-xs text-muted-foreground">{k}</p>
              <p className="text-lg font-bold text-forest">{v}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{detail?.name} — Plot Details</DialogTitle>
          </DialogHeader>
          {detail && (
            <>
              <img
                src={detail.image}
                alt={detail.name}
                className="h-40 w-full rounded-xl object-cover"
              />
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">{t("Area")}</dt>
                  <dd className="font-medium">{detail.area}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{t("Variety")}</dt>
                  <dd className="font-medium">{detail.variety}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{t("Sowing Date")}</dt>
                  <dd className="font-medium">{detail.sowing}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{t("Irrigation")}</dt>
                  <dd className="font-medium">{detail.irrigation}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{t("Health Status")}</dt>
                  <dd>
                    <StatusBadge status={detail.status} />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{t("Last Advisory")}</dt>
                  <dd className="font-medium">{t("20 Aug 2026")}</dd>
                </div>
              </dl>
              <p className="rounded-xl bg-pale/60 p-3 text-sm">
                {t(
                  "Next recommended action: monitor for leaf yellowing and maintain drainage after the\n                expected rainfall.",
                )}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
