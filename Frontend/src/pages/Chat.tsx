import { useEffect, useRef, useState } from "react";
import { ImagePlus, Mic, Phone, Send, Smile, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { PageHeader } from "@/components/skl/common";
import { useStore } from "@/lib/skl/store";
import { cropImages } from "@/lib/skl/data";
import { cn } from "@/lib/utils";
import { t } from "@/lib/skl/i18n";

const FARMERS = [
  {
    name: "Ramesh Patil",
    crop: "Soybean",
    last: "Rain is expected tomorrow. Should I still spray?",
    time: "09:27 AM",
    unread: 2,
  },
  {
    name: "Sunita Shinde",
    crop: "Tomato",
    last: "Sir, I have uploaded the fruit borer photos.",
    time: "Yesterday",
    unread: 1,
  },
  {
    name: "Vikas More",
    crop: "Sugarcane",
    last: "Thank you sir, crop is recovering well.",
    time: "Mon",
    unread: 0,
  },
  {
    name: "Anita Kale",
    crop: "Wheat",
    last: "Should I re-sow the failed patch?",
    time: "Sun",
    unread: 0,
  },
];

export function ChatPage({ as }: { as: "farmer" | "officer" }) {
  const { chat, sendChat } = useStore();
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [active, setActive] = useState(FARMERS[0]!.name);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.length, typing]);

  const me = as === "farmer" ? "farmer" : "officer";
  const other = as === "farmer" ? "officer" : "farmer";

  const send = (payload?: { image?: string; text?: string }) => {
    const body = payload?.text ?? text.trim();
    if (!body && !payload?.image) return;
    sendChat({
      from: me,
      text: body || "📷 Photo",
      ...(payload?.image ? { image: payload.image } : {}),
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    });
    setText("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      sendChat({
        from: other,
        text:
          as === "farmer"
            ? "Thank you for the update. Continue the recommended dose and share a photo after 3 days. Avoid spraying if rain continues."
            : "Thank you sir, I will follow the advice and update you after applying.",
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      });
    }, 1800);
  };

  return (
    <>
      <PageHeader
        title={as === "farmer" ? "Chat with Expert" : "Chat with Farmers"}
        subtitle={
          as === "farmer"
            ? "Direct conversation with your assigned Krushi Adhikari."
            : "Answer follow-up questions from farmers in your district."
        }
        breadcrumb={["Dashboard", "Chat"]}
      />
      <div
        className={cn(
          "w-full",
          as === "officer"
            ? "grid items-stretch gap-4 lg:grid-cols-[20rem_1fr]"
            : "mx-auto max-w-[1100px]",
        )}
      >
        {as === "officer" && (
          <Card className="flex h-[calc(100vh-250px)] min-h-[520px] flex-col gap-0 overflow-hidden p-0 sm:min-h-[550px]">
            <div className="border-b p-3">
              <Input placeholder={t("Search farmer conversations")} />
            </div>
            <ScrollArea className="min-h-0 flex-1">
              {FARMERS.map((f) => (
                <button
                  key={f.name}
                  onClick={() => setActive(f.name)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b p-3 text-left hover:bg-muted/60",
                    active === f.name && "bg-pale/60",
                  )}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-pale text-xs font-semibold text-forest">
                    {f.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">{f.name}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground">{f.time}</span>
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">{f.last}</span>
                    <span className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {f.crop}
                      </Badge>
                      {f.unread > 0 && (
                        <Badge className="h-4 rounded-full px-1.5 text-[10px]">
                          {f.unread} new
                        </Badge>
                      )}
                    </span>
                  </span>
                </button>
              ))}
            </ScrollArea>
          </Card>
        )}

        <Card className="flex h-[calc(100vh-250px)] min-h-[520px] flex-col gap-0 overflow-hidden p-0 sm:min-h-[550px]">
          <div className="flex flex-wrap items-center gap-3 border-b p-3 sm:gap-4 sm:p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-pale font-semibold text-forest sm:size-12 sm:text-lg">
              {as === "farmer"
                ? "SD"
                : active
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold sm:text-lg">
                {as === "farmer" ? "Dr. S. K. Deshmukh" : active}
              </p>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {as === "farmer" ? "Krushi Adhikari" : "Farmer • Solapur"} ·{" "}
                <span className="text-primary">{t("\ud83d\udfe2 Online")}</span>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={() => toast.info("Voice call is simulated in this prototype.")}
            >
              <Phone className="size-4" />{" "}
              <span className="hidden sm:inline">{t("Voice Call")}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={() => toast.info("Opening profile (demo)")}
            >
              <UserCircle className="size-4" />{" "}
              <span className="hidden sm:inline">{t("Profile")}</span>
            </Button>
          </div>

          <ScrollArea className="min-h-0 flex-1 bg-pale/30">
            <div className="space-y-3 p-4 sm:space-y-4 sm:p-6 lg:px-8">
              {chat.map((m) => (
                <div
                  key={m.id}
                  className={cn("flex", m.from === me ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm break-words shadow-soft sm:max-w-[70%]",
                      m.from === me
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-card",
                    )}
                  >
                    {m.image && (
                      <img
                        src={m.image}
                        alt="Shared crop"
                        className="mb-2 h-auto max-h-72 w-full max-w-[18rem] rounded-lg object-cover"
                      />
                    )}
                    <p>{t(m.text)}</p>
                    <p
                      className={cn(
                        "mt-1 text-[10px]",
                        m.from === me ? "text-white/70" : "text-muted-foreground",
                      )}
                    >
                      {m.time}
                    </p>
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm bg-card px-4 py-3 text-sm shadow-soft">
                    <span className="flex gap-1">
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                    </span>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </ScrollArea>

          <form
            className="flex w-full items-center gap-1.5 border-t p-2 sm:gap-2 sm:p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label={t("Attach image")}
              onClick={() =>
                send({ image: cropImages.leaf, text: "Sharing a photo of the affected leaves." })
              }
            >
              <ImagePlus className="size-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label={t("Record voice")}
              onClick={() => toast.success("Voice note attached (demo)")}
            >
              <Mic className="size-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label={t("Emoji")}
              onClick={() => setText((t) => t + " 🙏")}
            >
              <Smile className="size-5" />
            </Button>
            <Input
              className="min-w-0 flex-1"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
              placeholder={t("Type your message...")}
              aria-label={t("Message")}
            />
            <Button type="submit" size="icon" className="shrink-0" aria-label={t("Send message")}>
              <Send className="size-4" />
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}
