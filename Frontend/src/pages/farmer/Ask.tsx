import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  ImagePlus,
  Info,
  MapPin,
  Mic,
  Play,
  Scan,
  Square,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { useStore } from "@/lib/skl/store";
import { CROPS, STAGES, cropImages, type Query } from "@/lib/skl/data";
import { t } from "@/lib/skl/i18n";

const SAMPLE_IMAGES = [cropImages.leaf, cropImages.Soybean, cropImages.Cotton, cropImages.Onion];

function VoiceRecorder({ onChange }: { onChange: (v: string | null) => void }) {
  const [rec, setRec] = useState(false);
  const [secs, setSecs] = useState(0);
  const [saved, setSaved] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  const start = () => {
    setRec(true);
    setSecs(0);
    timer.current = setInterval(() => setSecs((s) => s + 1), 1000);
  };
  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    setRec(false);
    const v = `00:${String(secs).padStart(2, "0")}`;
    setSaved(v);
    onChange(v);
    toast.success("Voice note attached successfully");
  };

  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      {!rec && !saved && (
        <Button type="button" variant="outline" onClick={start} className="gap-2">
          <Mic className="size-4" /> {t("\ud83c\udf99 Record Voice")}
        </Button>
      )}
      {rec && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 text-sm font-medium text-destructive">
            <span className="size-2 animate-pulse rounded-full bg-destructive" /> Recording... 00:
            {String(secs).padStart(2, "0")}
          </span>
          <Progress value={Math.min(100, secs * 5)} className="h-1.5 w-32" />
          <Button type="button" size="sm" onClick={stop} className="gap-1.5">
            <Square className="size-3.5" /> {t("Stop")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              if (timer.current) clearInterval(timer.current);
              setRec(false);
            }}
          >
            <Trash2 className="size-3.5" /> {t("Delete")}
          </Button>
        </div>
      )}
      {saved && !rec && (
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="rounded-full">{t("Voice note attached successfully")}</Badge>
          <span className="text-sm text-muted-foreground">Duration {saved}</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => toast.info("Playing voice note (demo)")}
            className="gap-1.5"
          >
            <Play className="size-3.5" /> {t("Play")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setSaved(null);
              onChange(null);
            }}
            className="gap-1.5"
          >
            <Trash2 className="size-3.5" /> {t("Delete")}
          </Button>
        </div>
      )}
    </div>
  );
}

export function ImageUploader({
  images,
  setImages,
}: {
  images: string[];
  setImages: (i: string[]) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
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
  const { addQuery } = useStore();
  const navigate = useNavigate();
  const [crop, setCrop] = useState("Soybean");
  const [stage, setStage] = useState("Vegetative");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [voice, setVoice] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [location, setLocation] = useState({
    village: "Akluj",
    district: "Solapur",
    state: "Maharashtra",
  });

  const submit = () => {
    if (title.trim().length < 5) {
      toast.error("Please enter a problem title (min 5 characters)");
      return;
    }
    if (desc.trim().length < 20) {
      toast.error("Please describe the problem in at least 20 characters");
      return;
    }
    const id = `QRY-2026-${1045 + Math.floor(Math.random() * 400)}`;
    const q: Query = {
      id,
      farmer: "Ramesh Patil",
      farmerVillage: location.village,
      district: location.district,
      crop,
      stage,
      title: title.trim(),
      description: desc.trim(),
      images: images.length ? images : [cropImages.leaf],
      ...(voice ? { voiceNote: voice } : {}),
      createdAt: "21 Aug 2026",
      updatedAt: "21 Aug 2026",
      officer: null,
      status: "Pending",
      extra: {
        irrigation: "Drip",
        soil: "Medium Black Soil",
        lastFertilizer: "DAP at sowing",
        lastPesticide: "None in last 30 days",
      },
      timeline: [
        { label: "Query Submitted", date: "21 Aug 2026", done: true },
        { label: "Officer Assigned", date: "Pending", done: false },
        { label: "Under Review", date: "Pending", done: false },
        { label: "Recommendation Received", date: "Pending", done: false },
        { label: "Follow-up", date: "Pending", done: false },
        { label: "Resolved", date: "Pending", done: false },
      ],
    };
    addQuery(q);
    setDone(id);
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
                <Label htmlFor="qtitle">{t("Problem Title")}</Label>
                <Input
                  id="qtitle"
                  value={title}
                  maxLength={120}
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
                  maxLength={1000}
                  rows={6}
                  onChange={(e) => setDesc(e.target.value)}
                  className="mt-1.5"
                  placeholder={t(
                    "Describe symptoms, when they started, area affected, recent weather, pesticide/fertilizer usage, etc.",
                  )}
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">
                  {desc.length}/1000 characters
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title={t("Voice Query")}
            desc={t("Prefer speaking? Record your problem in your language.")}
          >
            <VoiceRecorder onChange={setVoice} />
          </SectionCard>

          <SectionCard title={t("Upload Crop Images")} desc={t("Up to 4 photographs")}>
            <ImageUploader images={images} setImages={setImages} />
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title={t("Query Location")}>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 size-4 text-primary" />
              <div>
                <p>
                  {t("Village:")} <b>{location.village}</b>
                </p>
                <p>
                  {t("District:")} <b>{location.district}</b>
                </p>
                <p>
                  {t("State:")} <b>{location.state}</b>
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={() => {
                setLocation({ village: "Sangola", district: "Solapur", state: "Maharashtra" });
                toast.success("Location updated to Sangola, Solapur");
              }}
            >
              {t("Update Location")}
            </Button>
          </SectionCard>

          <Card className="gap-0 border-primary/30 bg-pale/60 p-4">
            <p className="flex items-start gap-2 text-sm">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" />
              {t("Our Krushi Adhikari will review your question and get back to you soon.")}
            </p>
          </Card>

          <Button size="lg" className="h-12 w-full text-base" onClick={submit}>
            {t("Submit Question")}
          </Button>

          <SectionCard title={t("Tips for a faster reply")}>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{t("\ud83d\udcf7 Add at least 2 close-up photos in daylight.")}</li>
              <li>{t("\ud83d\udd52 Mention when the symptoms first appeared.")}</li>
              <li>{t("\ud83d\udca7 Share irrigation type and last fertilizer used.")}</li>
            </ul>
          </SectionCard>
        </div>
      </div>

      <Dialog open={!!done} onOpenChange={() => setDone(null)}>
        <DialogContent className="text-center sm:max-w-md">
          <CheckCircle2 className="mx-auto size-14 text-primary" />
          <h2 className="text-xl font-bold">{t("Question Submitted Successfully")}</h2>
          <p className="text-sm text-muted-foreground">{t("Query ID")}</p>
          <p className="text-lg font-bold text-forest">{done}</p>
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
