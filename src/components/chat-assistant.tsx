import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askAdvisor } from "@/lib/career.functions";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

export function ChatAssistant({ reportId }: { reportId: string | null }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! Ask me anything about your career report or next steps." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const ask = useServerFn(askAdvisor);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await ask({ data: { reportId, messages: next.slice(-10) } });
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch (e) {
      setMessages([
        ...next,
        { role: "assistant", content: (e as Error).message || "Something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div className="glass-strong animate-rise fixed right-4 bottom-24 z-50 flex h-[26rem] w-[min(22rem,calc(100vw-2rem))] flex-col rounded-3xl p-4">
          <div className="flex items-center justify-between pb-3">
            <span className="font-display text-sm font-bold">AI Career Assistant</span>
            <Button variant="ghost" size="icon" className="size-7" onClick={() => setOpen(false)}>
              <X className="size-4" />
            </Button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto pr-1 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 leading-relaxed",
                  m.role === "user"
                    ? "hero-gradient ml-auto text-primary-foreground"
                    : "glass text-foreground",
                )}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="glass flex w-fit items-center gap-2 rounded-2xl px-3 py-2 text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" /> thinking…
              </div>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask a question…"
              className="glass h-10 rounded-xl border-transparent"
            />
            <Button size="icon" className="size-10 rounded-xl" onClick={send} disabled={loading}>
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      )}
      <Button
        size="icon"
        className="fixed right-4 bottom-6 z-50 size-14 rounded-2xl shadow-xl"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open AI assistant"
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </Button>
    </>
  );
}
