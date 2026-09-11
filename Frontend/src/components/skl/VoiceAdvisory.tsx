import { useEffect, useRef, useState } from "react";
import { Download, Mic, Pause, Play, Square, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { t } from "@/lib/skl/i18n";

export interface VoiceAdvisory {
  url: string;
  duration: string;
}

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/** Live waveform bars driven by mic level, or a gentle idle animation as fallback. */
function Waveform({ levels }: { levels: number[] }) {
  return (
    <div className="flex h-10 flex-1 items-center gap-[3px] overflow-hidden rounded-lg bg-pale/60 px-2">
      {levels.map((v, i) => (
        <span
          key={i}
          className="w-[3px] shrink-0 rounded-full bg-primary/80 transition-[height] duration-100"
          style={{ height: `${Math.max(8, Math.min(100, v * 100))}%` }}
        />
      ))}
    </div>
  );
}

export function VoiceAdvisoryRecorder({
  value,
  onChange,
}: {
  value: VoiceAdvisory | null;
  onChange: (v: VoiceAdvisory | null) => void;
}) {
  const [enabled, setEnabled] = useState(false);
  const [recording, setRecording] = useState(false);
  const [secs, setSecs] = useState(0);
  const [levels, setLevels] = useState<number[]>(Array(48).fill(0.1));

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const raf = useRef<number | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const startedAt = useRef(0);

  const cleanup = () => {
    if (timer.current) clearInterval(timer.current);
    if (raf.current) cancelAnimationFrame(raf.current);
    stream.current?.getTracks().forEach((tr) => tr.stop());
    void audioCtx.current?.close().catch(() => {});
    timer.current = null;
    raf.current = null;
    stream.current = null;
    audioCtx.current = null;
    recorder.current = null;
  };

  useEffect(() => () => cleanup(), []);

  const pushLevel = (v: number) => setLevels((l) => [...l.slice(1), v]);

  const start = async () => {
    setSecs(0);
    startedAt.current = Date.now();
    chunks.current = [];
    setRecording(true);
    timer.current = setInterval(
      () => setSecs(Math.round((Date.now() - startedAt.current) / 1000)),
      500,
    );

    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = s;
      const ctx = new AudioContext();
      audioCtx.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      ctx.createMediaStreamSource(s).connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let peak = 0;
        for (const b of buf) peak = Math.max(peak, Math.abs(b - 128) / 128);
        pushLevel(Math.max(0.08, peak * 1.8));
        raf.current = requestAnimationFrame(tick);
      };
      tick();

      const mr = new MediaRecorder(s);
      recorder.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunks.current, { type: mr.mimeType || "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          onChange({
            url: String(reader.result),
            duration: fmt(Math.max(1, Math.round((Date.now() - startedAt.current) / 1000))),
          });
          toast.success(t("Voice advisory recorded"));
        };
        reader.readAsDataURL(blob);
      };
      mr.start();
    } catch {
      // No microphone permission in this environment — animate a demo waveform.
      raf.current = requestAnimationFrame(function loop() {
        pushLevel(0.15 + Math.random() * 0.7);
        raf.current = requestAnimationFrame(loop);
      });
      toast.info(t("Microphone unavailable — recording a demo advisory"));
    }
  };

  const stop = () => {
    setRecording(false);
    const secondsRecorded = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
    if (recorder.current && recorder.current.state !== "inactive") {
      recorder.current.stop();
    } else {
      onChange({ url: "", duration: fmt(secondsRecorded) });
      toast.success(t("Voice advisory recorded"));
    }
    cleanup();
  };

  const discard = () => {
    cleanup();
    setRecording(false);
    setSecs(0);
    setLevels(Array(48).fill(0.1));
    onChange(null);
  };

  return (
    <div className="rounded-xl border bg-muted/30 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Mic className="size-4 text-primary" />
          <Label htmlFor="voice-advisory" className="text-sm font-semibold">
            {t("Record Voice Advisory")}
          </Label>
        </div>
        <Switch
          id="voice-advisory"
          checked={enabled}
          onCheckedChange={(v) => {
            setEnabled(v);
            if (!v) discard();
          }}
          aria-label={t("Record Voice Advisory")}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {t(
          "Farmers who prefer listening can play your spoken advice along with the written prescription.",
        )}
      </p>

      {enabled && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-2">
            <Waveform levels={levels} />
            <span
              className={cn(
                "w-14 text-right font-mono text-xs",
                recording ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {recording ? fmt(secs) : (value?.duration ?? "00:00")}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {!recording && (
              <Button
                type="button"
                size="sm"
                variant={value ? "outline" : "default"}
                className="gap-1.5"
                onClick={() => void start()}
              >
                <Mic className="size-3.5" /> {value ? t("Re-record") : t("Start Recording")}
              </Button>
            )}
            {recording && (
              <Button type="button" size="sm" className="gap-1.5" onClick={stop}>
                <Square className="size-3.5" /> {t("Stop Recording")}
              </Button>
            )}
            {value && !recording && (
              <Button type="button" size="sm" variant="ghost" className="gap-1.5" onClick={discard}>
                <Trash2 className="size-3.5" /> {t("Delete")}
              </Button>
            )}
          </div>
          {value && !recording && <VoiceAdvisoryPlayer advisory={value} label={t("Preview")} />}
        </div>
      )}
    </div>
  );
}

/** Play / pause an advisory clip with a duration badge and download option. */
export function VoiceAdvisoryPlayer({
  advisory,
  label,
}: {
  advisory: VoiceAdvisory;
  label?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(
    () => () => {
      audio.current?.pause();
    },
    [],
  );

  const toggle = () => {
    if (!advisory.url) {
      toast.info(t("Playing voice advisory (demo clip)"));
      setPlaying((p) => !p);
      return;
    }
    if (!audio.current) {
      audio.current = new Audio(advisory.url);
      audio.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audio.current.pause();
      setPlaying(false);
    } else {
      void audio.current.play().catch(() => toast.error(t("Unable to play this clip")));
      setPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-pale/50 p-2.5">
      <Button
        type="button"
        size="icon"
        className="size-9 shrink-0 rounded-full"
        onClick={toggle}
        aria-label={playing ? t("Pause voice advisory") : t("Play voice advisory")}
      >
        {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
      </Button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {label ?? t("Voice Advisory from Krushi Adhikari")}
        </p>
        <div className="mt-1 flex h-4 items-center gap-[2px]">
          {Array.from({ length: 32 }).map((_, i) => (
            <span
              key={i}
              className={cn("w-[3px] rounded-full bg-primary/60", playing && "animate-pulse")}
              style={{ height: `${25 + Math.abs(Math.sin(i * 1.7)) * 70}%` }}
            />
          ))}
        </div>
      </div>
      <Badge variant="secondary" className="shrink-0 font-mono text-[11px]">
        {advisory.duration}
      </Badge>
      {advisory.url ? (
        <a
          href={advisory.url}
          download={`krushi-advisory-${advisory.duration.replace(":", "m")}s.webm`}
          aria-label={t("Download voice advisory")}
        >
          <Button type="button" size="icon" variant="ghost" className="size-9">
            <Download className="size-4" />
          </Button>
        </a>
      ) : (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-9"
          aria-label={t("Download voice advisory")}
          onClick={() => toast.info(t("Demo clip — download available for real recordings"))}
        >
          <Download className="size-4" />
        </Button>
      )}
    </div>
  );
}
