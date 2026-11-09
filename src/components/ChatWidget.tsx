"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

const chatTransport = new DefaultChatTransport({ api: "/api/chat" });

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, status, error, stop } = useChat({
    transport: chatTransport,
  });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status, open]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3 sm:bottom-7 sm:right-7">
      {open && (
        <section
          role="dialog"
          aria-label="AI Health Assistant"
          className="chat-widget-panel flex h-[min(680px,calc(100dvh-7rem))] w-[min(420px,calc(100vw-2rem))] origin-bottom-right flex-col overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-2xl shadow-blue-950/20 animate-chat-pop"
        >
          <header className="flex items-center gap-3 bg-gradient-to-r from-blue-700 to-blue-600 px-5 py-4 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={1.8}>
                <path d="M12 7v10M7 12h10" strokeLinecap="round" />
                <path d="M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold leading-tight">AI Health Assistant</h2>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-blue-100">
                <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
                Here to help with general health questions
              </p>
            </div>
            {busy && <button type="button" onClick={stop} className="rounded-lg px-2 py-1 text-xs font-semibold text-blue-100 hover:bg-white/10">Stop</button>}
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-lg p-2 text-blue-100 transition hover:bg-white/15 hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={2}><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" /></svg>
            </button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-blue-50/60 to-white p-4 sm:p-5" aria-live="polite">
            {messages.length === 0 && (
              <div className="chat-welcome-card rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8}><path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.64 5.64l1.42 1.42m9.88 9.88 1.42 1.42m0-12.72-1.42 1.42m-9.88 9.88-1.42 1.42" strokeLinecap="round" /><circle cx="12" cy="12" r="4" /></svg>
                </div>
                <h3 className="font-bold text-blue-950">How can I help today?</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">Share what you’re experiencing. I can offer general information and help you think about what to ask a doctor.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["I have a headache", "How do home visits work?"].map((suggestion) => (
                  <button key={suggestion} type="button" disabled={busy} onClick={() => sendMessage({ text: suggestion })} className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50">
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === "user" ? "rounded-br-md bg-blue-700 text-white shadow-sm" : "rounded-bl-md border border-slate-100 bg-white text-slate-700 shadow-sm"}`}>
                  {message.parts.map((part, index) => part.type === "text" ? <span key={index}>{part.text}</span> : null)}
                </div>
              </div>
            ))}

            {busy && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-blue-100 bg-white px-4 py-3.5 shadow-sm" aria-label="Assistant is thinking">
                  <span className="chat-typing-dot h-2 w-2 rounded-full bg-blue-400" />
                  <span className="chat-typing-dot chat-typing-delay-1 h-2 w-2 rounded-full bg-blue-400" />
                  <span className="chat-typing-dot chat-typing-delay-2 h-2 w-2 rounded-full bg-blue-400" />
                </div>
              </div>
            )}
            {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">The assistant had trouble responding. Please try again.</p>}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-blue-100 bg-white px-4 pb-4 pt-3">
            <form onSubmit={handleSubmit} className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
              <label className="sr-only" htmlFor="health-chat-input">Ask a health question</label>
              <textarea
                id="health-chat-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                maxLength={2000}
                rows={1}
                placeholder="Type your question…"
                className="max-h-28 min-h-10 flex-1 resize-y bg-transparent px-2 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
              <button type="submit" disabled={!input.trim() || busy} aria-label="Send message" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={2}><path d="m5 12 14-7-4 14-3-6-7-1Z" strokeLinejoin="round" /><path d="m12 13 7-8" strokeLinecap="round" /></svg>
              </button>
            </form>
            <p className="mt-2.5 text-center text-[10px] leading-relaxed text-slate-500">AI Assistant: For informational purposes only. Not a substitute for professional medical advice.</p>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-label={open ? "Close AI Health Assistant" : "Open AI Health Assistant"}
        aria-expanded={open}
        className="chat-launcher group flex h-16 w-16 items-center justify-center rounded-full bg-blue-700 text-white shadow-xl shadow-blue-900/25 transition duration-200 hover:scale-105 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth={2}><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 transition-transform group-hover:scale-110" stroke="currentColor" strokeWidth={1.8}><path d="M7 10h10M7 14h6" strokeLinecap="round" /><path d="M20 11.5a7.5 7.5 0 0 1-8 7.48 8.5 8.5 0 0 1-3.4-.7L4 20l1.2-3.3A7.32 7.32 0 0 1 4 12.5 7.5 7.5 0 0 1 12 5a7.5 7.5 0 0 1 8 6.5Z" strokeLinejoin="round" /><path d="M12 2v2m-1-1h2" strokeLinecap="round" /></svg>
        )}
      </button>
    </div>
  );
}
