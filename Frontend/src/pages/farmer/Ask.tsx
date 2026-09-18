import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Info, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, X, ImagePlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { PageHeader, SectionCard } from "@/components/skl/common";
import { CROPS, STAGES, cropImages } from "@/lib/skl/data";
import {
  QUERY_CATEGORIES,
  createFarmerQuery,
  type BackendQueryPriority,
} from "@/lib/skl/queries";
import { t } from "@/lib/skl/i18n";

const SAMPLE_IMAGES = [cropImages.leaf, cropImages.Soybean, cropImages.Cotton, cropImages.Onion];

export function ImageUploader({
  images,
  setImages,
  disabledText,
}: {
  images: string[];
  setImages: (i: string[]) => void;
  disabledText?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  if (disabledText) {
    return (
      <p className="rounded-xl border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
        {disabledText}
      </p>
    );
  }
  const add = () => {
    if (images.length >= 4) {
      toast.error("You can upload up to 4 images");
      return;
    }
    setImages([...images, SAMPLE_IMAGES[images.length % SAMPLE_IMAGES.length]!]);
    toast.success("Image added");
  };
  return (
    <div>
      <div
        onClick={add}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          add();
        }}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 px-6 py-8 text-center hover:bg-muted/60"
      >
        <Upload className="size-6 text-primary" />
        <p className="mt-2 text-sm font-medium">
          {t("Drag & drop crop images here, or tap to select")}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("Upload clear close-up images of affected leaves, fruits or plants.")}
        </p>
      </div>
      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img, i) => (
            <div key={i} className="group relative overflow-hidden rounded-xl border">
              <img
                src={img}
                alt={`Crop upload ${i + 1}`}
                loading="lazy"
                width={800}
                height={600}
                className="h-24 w-full cursor-pointer object-cover"
                onClick={() => setPreview(img)}
              />
              <button
                onClick={() => setImages(images.filter((_, x) => x !== i))}
                aria-label={t("Remove image")}
                className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-background/90 text-destructive"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
          {images.length < 4 && (
            <button
              onClick={add}
              className="flex h-24 flex-col items-center justify-center rounded-xl border border-dashed text-xs text-muted-foreground hover:bg-muted"
            >
              <ImagePlus className="mb-1 size-5" /> {t("Add another")}
            </button>
          )}
        </div>
      )}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="sm:max-w-xl">
          {preview && <img src={preview} alt="Crop preview" className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function AskQuestionPage() {
  const navigate = useNavigate();
  const [crop, setCrop] = useState("Soybean");
  const [category, setCategory] = useState("Crop Disease");
  const [priority, setPriority] = useState<BackendQueryPriority>("MEDIUM");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [done, setDone] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (title.trim().length < 5) {
      toast.error("Please enter a problem title (min 5 characters)");
      return;
    }
    if (desc.trim().length < 10) {
      toast.error("Please describe the problem in at least 10 characters");
      return;
    }
    setSubmitting(true);
    try {
      const created = await createFarmerQuery({
        title: title.trim(),
        cropName: crop.trim(),
        category: category.trim(),
        description: desc.trim(),
        priority,
      });
      setDone(created.id);
      toast.success("Query submitted successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit query.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title={t("Ask a Question")}
        subtitle={t("Describe your crop problem \u2014 a verified Krushi Adhikari will review it.")}
        breadcrumb={["Dashboard", "Ask Question"]}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <SectionCard title={t("Describe Your Problem")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{t("Select Crop")}</Label>
                <Select value={crop} onValueChange={setCrop}>
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
                <Label>{t("Category")}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1.5 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUERY_CATEGORIES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("Priority")}</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as BackendQueryPriority)}>
                  <SelectTrigger className="mt-1.5 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="qtitle">{t("Problem Title")}</Label>
                <Input
                  id="qtitle"
                  value={title}
                  maxLength={200}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1.5"
                  placeholder={t("Leaves are turning yellow")}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="qdesc">{t("Describe Your Problem in Detail")}</Label>
                <Textarea
                  id="qdesc"
                  value={desc}
                  maxLength={5000}
                  rows={6}
                  onChange={(e) => setDesc(e.target.value)}
                  className="mt-1.5"
                  placeholder={t(
                    "Describe symptoms, when they started, area affected, recent weather, pesticide/fertilizer usage, etc.",
                  )}
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">
                  {desc.length}/5000 characters
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title={t("Voice Query")}
            desc={t("Coming soon — text-based queries only in this version.")}
          >
            <p className="rounded-xl border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
              {t("Voice upload is coming soon. Please describe your problem in text for this version.")}
            </p>
          </SectionCard>

          <SectionCard title={t("Upload Crop Images")} desc={t("Coming soon")}>
            <ImageUploader
              images={[]}
              setImages={() => undefined}
              disabledText={t("Image upload is coming soon. Please submit a text-only query for this version.")}
            />
          </SectionCard>
        </div>

        <div className="space-y-4">
          <Card className="gap-0 border-primary/30 bg-pale/60 p-4">
            <p className="flex items-start gap-2 text-sm">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" />
              {t("Our Krushi Adhikari will review your question and get back to you soon.")}
            </p>
          </Card>

          <Button size="lg" className="h-12 w-full text-base" onClick={submit} disabled={submitting}>
            {submitting ? t("Submitting...") : t("Submit Question")}
          </Button>

          <SectionCard title={t("Tips for a faster reply")}>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{t("Mention when the symptoms first appeared.")}</li>
              <li>{t("Share irrigation type and last fertilizer used.")}</li>
              <li>{t("Image and voice uploads are coming soon.")}</li>
            </ul>
          </SectionCard>
        </div>
      </div>

      <Dialog open={done !== null} onOpenChange={() => setDone(null)}>
        <DialogContent className="text-center sm:max-w-md">
          <CheckCircle2 className="mx-auto size-14 text-primary" />
          <h2 className="text-xl font-bold">{t("Question Submitted Successfully")}</h2>
          <p className="text-sm text-muted-foreground">{t("Query ID")}</p>
          <p className="text-lg font-bold text-forest">#{done}</p>
          <Badge
            variant="outline"
            className="mx-auto rounded-full border-warning/40 bg-warning/10 text-warning"
          >
            {t("Status: Pending Expert Review")}
          </Badge>
          <div className="mt-2 flex gap-2">
            <Button
              className="flex-1"
              onClick={() => navigate({ to: "/app/$", params: { _splat: "farmer/questions" } })}
            >
              {t("View Question")}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate({ to: "/app/$", params: { _splat: "farmer/dashboard" } })}
            >
              {t("Back to Dashboard")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function DiagnosePage() {
  const [images, setImages] = useState<string[]>([]);
  const [crop, setCrop] = useState("Soybean");
  const [stage, setStage] = useState("Vegetative");
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState(false);
  const [loading, setLoading] = useState(false);

  const run = () => {
    if (images.length === 0) {
      toast.error("Upload at least one crop image");
      return;
    }
    setLoading(true);
    setResult(false);
    setTimeout(() => {
      setLoading(false);
      setResult(true);
    }, 1400);
  };

  return (
    <>
      <PageHeader
        title={t("Crop Problem Identification")}
        subtitle={t(
          "This preliminary check helps describe your problem. The final recommendation always comes from a Krushi Adhikari.",
        )}
        breadcrumb={["Dashboard", "Diagnose Crop"]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title={t("Upload Crop Image")}>
          <ImageUploader images={images} setImages={setImages} />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label>{t("Crop")}</Label>
              <Select value={crop} onValueChange={setCrop}>
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
              <Label>{t("Crop Stage")}</Label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>{t("Symptoms")}</Label>
              <Textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                maxLength={500}
                rows={3}
                className="mt-1.5"
                placeholder={t("Yellowing between veins, curling of new leaves, brown spots...")}
              />
            </div>
          </div>
          <Button className="mt-4 w-full gap-2" onClick={run} disabled={loading}>
            <Scan className="size-4" /> {loading ? "Analysing image..." : "Run Preliminary Check"}
          </Button>
        </SectionCard>

        <div className="space-y-4">
          {loading && (
            <Card className="gap-0 p-5">
              <div className="space-y-3">
                <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-20 animate-pulse rounded bg-muted" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              </div>
            </Card>
          )}
          {result && !loading && (
            <SectionCard
              title={t("Preliminary Visual Assessment")}
              desc={t("Not a confirmed diagnosis")}
            >
              <Badge
                variant="outline"
                className="rounded-full border-warning/40 bg-warning/10 text-warning"
              >
                {t("Preliminary visual assessment")}
              </Badge>
              <h3 className="mt-3 text-lg font-semibold">
                {t("Possible Issue: Leaf Spot / Nutrient Deficiency")}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Image patterns on {crop} at {stage} stage resemble early leaf spot with possible
                nitrogen deficiency. Field verification is required before applying any input.
              </p>
              <div className="mt-4 space-y-2 text-sm">
                <p>• Check lower leaves for uniform yellowing (nutrient) vs spots (fungal).</p>
                <p>{t("\u2022 Inspect soil moisture and drainage in the affected patch.")}</p>
                <p>{t("\u2022 Do not spray before officer verification.")}</p>
              </div>
              <Link to="/app/$" params={{ _splat: "farmer/ask" }}>
                <Button className="mt-4 w-full">
                  {t("Send to Krushi Adhikari for Verification")}
                </Button>
              </Link>
            </SectionCard>
          )}
          {!result && !loading && (
            <Card className="gap-0 border-dashed p-8 text-center">
              <Scan className="mx-auto size-8 text-primary" />
              <p className="mt-3 font-medium">{t("No assessment yet")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("Upload a photo and run the preliminary check.")}
              </p>
            </Card>
          )}
          <Card className="gap-0 border-primary/30 bg-pale/60 p-4 text-sm">
            {t(
              "\ud83d\udee1 Automated output is supportive only. Official diagnosis and treatment is provided by a\n            verified Krushi Adhikari after reviewing your query.",
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
