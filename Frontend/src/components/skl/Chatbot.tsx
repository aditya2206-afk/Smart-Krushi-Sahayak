import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bot, Send, Sprout, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { t } from "@/lib/skl/i18n";

interface Msg {
  from: "bot" | "user";
  text: string;
  cta?: boolean;
}

const QUICK = [
  "How do I ask a question?",
  "How do I upload an image?",
  "Where can I view my queries?",
  "How do I change language?",
  "How do I buy a product?",
];

function answer(q: string): Msg {
  const s = q.toLowerCase();
  const diagnosisWords = [
    "disease",
    "what is wrong",
    "diagnose",
    "infected",
    "yellow",
    "pest attack",
  ];
  if (diagnosisWords.some((w) => s.includes(w)) && !s.includes("upload")) {
    return {
      from: "bot",
      text: "For accurate crop diagnosis, please upload your crop image and submit a query to a verified Krushi Adhikari.",
      cta: true,
    };
  }
  if (s.includes("ask") || s.includes("question"))
    return {
      from: "bot",
      text: "Open 'Ask Question' from the sidebar, choose your crop and stage, describe the problem, attach photos or a voice note, and press Submit Question.",
    };
  if (s.includes("upload") || s.includes("image") || s.includes("photo"))
    return {
      from: "bot",
      text: "On the Ask Question or Diagnose Crop page, use the 'Upload Crop Images' box. You can drag and drop or tap to select up to 4 clear close-up photos.",
    };
  if (s.includes("scheme"))
    return {
      from: "bot",
      text: "Go to Government Schemes in the sidebar. You can filter by Central or Maharashtra government, subsidy, insurance or loan, and save schemes for later.",
    };
  if (s.includes("view") || s.includes("my quer") || s.includes("status"))
    return {
      from: "bot",
      text: "Open 'My Questions'. Use the tabs to see Pending, Under Review, Answered and Resolved queries, and tap any card for the full timeline.",
    };
  if (s.includes("expert") || s.includes("contact") || s.includes("chat"))
    return {
      from: "bot",
      text: "Use 'Chat with Expert' to message your assigned Krushi Adhikari directly. You can send text, photos and voice notes.",
    };
  if (s.includes("language"))
    return {
      from: "bot",
      text: "Use the language selector in the top bar to switch between English, मराठी and हिंदी.",
    };
  if (s.includes("buy") || s.includes("product") || s.includes("order") || s.includes("cart"))
    return {
      from: "bot",
      text: "Open Marketplace, search the product, tap 'Add to Cart' and then Checkout. You can pay by Cash on Delivery, UPI or demo online payment.",
    };
  return {
    from: "bot",
    text: "I can help you use the platform — asking questions, uploading crop photos, checking schemes, weather, orders and language settings. What would you like to do?",
  };
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      from: "bot",
      text: "Namaskar! I am Krushi Sahayak Assistant. I help you use the platform. I do not diagnose crops — verified Krushi Adhikaris do that.",
    },
  ]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { from: "user", text }]);
    setInput("");
    setTimeout(() => setMsgs((m) => [...m, answer(text)]), 500);
  };

  return (
    <>
      {open && (
        <div className="fixed right-4 bottom-24 z-50 flex h-[30rem] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border bg-card shadow-lift sm:bottom-20">
          <div className="brand-gradient flex items-center gap-2.5 px-4 py-3 text-primary-foreground">
            <span className="grid size-8 place-items-center rounded-lg bg-white/15">
              <Bot className="size-4" />
            </span>
            <div className="flex-1 leading-tight">
              <p className="text-sm font-semibold">{t("Krushi Sahayak Assistant")}</p>
              <p className="text-[11px] text-white/75">
                {t("Platform help \u2022 not a crop doctor")}
              </p>
            </div>
            <button aria-label={t("Close assistant")} onClick={() => setOpen(false)}>
              <X className="size-4" />
            </button>
          </div>
          <ScrollArea className="flex-1 px-3 py-3">
            <div className="space-y-3">
              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={cn("flex", m.from === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                      m.from === "user"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-muted",
                    )}
                  >
                    {t(m.text)}
                    {m.cta && (
                      <Link
                        to="/app/$"
                        params={{ _splat: "farmer/ask" }}
                        onClick={() => setOpen(false)}
                      >
                        <Button size="sm" className="mt-2 w-full gap-1.5">
                          <Sprout className="size-3.5" /> {t("Ask Krushi Adhikari")}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="rounded-full border border-primary/25 bg-pale px-2.5 py-1 text-[11px] text-forest transition-colors hover:bg-primary/10"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t p-2.5"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("Ask about using the platform...")}
              aria-label={t("Message assistant")}
            />
            <Button type="submit" size="icon" aria-label={t("Send")}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
      <Button
        onClick={() => setOpen((o) => !o)}
        size="lg"
        className="fixed right-4 bottom-20 z-50 h-14 gap-2 rounded-full px-5 shadow-lift sm:bottom-6"
      >
        <Bot className="size-5" />
        <span className="hidden sm:inline">{t("Assistant")}</span>
      </Button>
    </>
  );
}
