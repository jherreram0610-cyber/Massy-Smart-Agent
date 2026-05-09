import React, { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface WidgetConfig {
  apiUrl?: string;
  primaryColor?: string;
  title?: string;
  subtitle?: string;
  welcomeMessage?: string;
}

declare global {
  interface Window {
    MassyWidget?: { init: (config: WidgetConfig) => void };
    massyWidgetConfig?: WidgetConfig;
  }
}

const DEFAULT_CONFIG: Required<WidgetConfig> = {
  apiUrl: "",
  primaryColor: "#00D4FF",
  title: "Massy Motors Smart",
  subtitle: "Agente IA · En línea",
  welcomeMessage: "¡Hola! Soy el asistente virtual de Massy Motors Smart Cali. ¿En qué puedo ayudarte hoy?",
};

function ChatWidget({ config }: { config: Required<WidgetConfig> }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: config.welcomeMessage },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${config.apiUrl}/api/agent/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationId }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setConversationId(json.data.conversationId);
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString() + "_a", role: "assistant", content: json.data.message },
        ]);
      } else {
        throw new Error(json.error?.message ?? "Error");
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + "_err", role: "assistant", content: "Lo siento, tuve un problema técnico. Por favor intenta de nuevo." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const primary = config.primaryColor;

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 99999, fontFamily: "system-ui, sans-serif" }}>
      {/* Chat panel */}
      {open && (
        <div style={{
          position: "absolute", bottom: "72px", right: 0,
          width: "360px", height: "520px",
          background: "#0D1730", borderRadius: "16px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          {/* Header */}
          <div style={{
            padding: "16px", display: "flex", alignItems: "center", gap: "12px",
            background: "#050B20", borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: primary, display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#050B20" strokeWidth="2.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: "14px", lineHeight: 1.2 }}>{config.title}</div>
              <div style={{ color: primary, fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                {config.subtitle}
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7FA3", padding: "4px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "80%", padding: "10px 14px", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: msg.role === "user" ? primary : "rgba(255,255,255,0.06)",
                  color: msg.role === "user" ? "#050B20" : "#E8EAF0",
                  fontSize: "13px", lineHeight: "1.5", fontWeight: msg.role === "user" ? 600 : 400,
                  whiteSpace: "pre-wrap",
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: "4px", padding: "10px 14px" }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{
                    width: "6px", height: "6px", borderRadius: "50%", background: "#6B7FA3",
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: "8px" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              disabled={loading}
              style={{
                flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px", padding: "10px 14px", color: "#E8EAF0", fontSize: "13px",
                outline: "none",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                background: primary, border: "none", borderRadius: "10px",
                width: "40px", height: "40px", cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: loading || !input.trim() ? 0.5 : 1, flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#050B20" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "56px", height: "56px", borderRadius: "50%",
          background: primary, border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 4px 24px ${primary}66`,
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#050B20" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#050B20" strokeWidth="2.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

function init(userConfig: WidgetConfig = {}) {
  const config: Required<WidgetConfig> = { ...DEFAULT_CONFIG, ...userConfig };
  const container = document.createElement("div");
  container.id = "massy-widget-root";
  document.body.appendChild(container);
  createRoot(container).render(React.createElement(ChatWidget, { config }));
}

// Auto-init if config present on window
if (typeof window !== "undefined") {
  window.MassyWidget = { init };
  if (window.massyWidgetConfig) {
    init(window.massyWidgetConfig);
  }
}

export { init };
