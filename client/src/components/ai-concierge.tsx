import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIConciergeProps {
  context?: {
    pickupAddress?: string;
    dropoffAddress?: string;
    vehicleType?: string;
    pickupDate?: string;
    pickupTime?: string;
  };
}

export function AIConcierge({ context }: AIConciergeProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to Shore Thing Transportation. I can help with route information, fare estimates, airport transfers, and service area questions. How can I assist you?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await apiRequest("POST", "/api/assistant", {
        message: userMsg,
        context,
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm having trouble connecting right now. Please try again or call us directly." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(213,55%,20%)] text-white shadow-lg transition-transform hover:scale-105 active:scale-95 md:h-14 md:w-14"
        data-testid="button-open-concierge"
      >
        <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex w-[340px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border bg-card shadow-xl md:w-[380px]"
      data-testid="concierge-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-[hsl(213,55%,14%)] px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[hsl(43,85%,55%)]" />
          <span className="text-sm font-semibold text-white">Ride Concierge</span>
          <span className="rounded bg-[hsl(43,85%,55%)]/20 px-1.5 py-0.5 text-[10px] font-medium text-[hsl(43,85%,55%)]">
            AI
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(false)}
          className="h-7 w-7 text-white/70 hover:bg-white/10 hover:text-white"
          data-testid="button-close-concierge"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: "320px", minHeight: "200px" }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-[hsl(213,55%,20%)] text-white"
                  : "bg-muted text-foreground"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-lg bg-muted px-3 py-2">
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask about routes, fares, airports..."
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-[hsl(43,85%,55%)]"
            data-testid="input-concierge"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            size="icon"
            className="h-9 w-9 shrink-0 bg-[hsl(213,55%,20%)] hover:bg-[hsl(213,55%,25%)]"
            data-testid="button-send-concierge"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
