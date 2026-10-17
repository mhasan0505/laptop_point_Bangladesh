"use client";

import { CheckCircle2, HelpCircle, Loader2, MessageCircleQuestion } from "lucide-react";
import { useEffect, useState } from "react";

interface PublicQuestion {
  id: string;
  userName: string;
  question: string;
  answer: string;
  createdAt: string;
}

type SubmitState = "idle" | "sending" | "sent" | "error";

export default function ProductQA({ productSlug }: { productSlug: string }) {
  const [items, setItems] = useState<PublicQuestion[] | null>(null);
  const [userName, setUserName] = useState("");
  const [question, setQuestion] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [mountedAt] = useState(() => Date.now());
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let ignore = false;
    fetch(`/api/questions?productSlug=${encodeURIComponent(productSlug)}`)
      .then((r) => (r.ok ? r.json() : { questions: [] }))
      .then((d) => !ignore && setItems(Array.isArray(d.questions) ? d.questions : []))
      .catch(() => !ignore && setItems([]));
    return () => {
      ignore = true;
    };
  }, [productSlug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setMessage("");
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug,
          userName,
          question,
          _hp: honeypot,
          _t: mountedAt,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not send your question");
      setState("sent");
      setQuestion("");
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Could not send your question");
    }
  }

  return (
    <section
      aria-labelledby="product-qa-heading"
      className="mx-auto w-full max-w-[95%] py-10"
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-8">
        <h2
          id="product-qa-heading"
          className="flex items-center gap-2 text-xl font-bold md:text-2xl"
        >
          <MessageCircleQuestion className="text-primary" size={24} />
          Questions &amp; Answers
        </h2>

        <div className="mt-5 space-y-4">
          {items === null && (
            <div className="space-y-3" aria-hidden>
              <div className="h-14 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-14 animate-pulse rounded-lg bg-gray-100" />
            </div>
          )}
          {items?.length === 0 && (
            <p className="flex items-center gap-2 text-sm text-gray-500">
              <HelpCircle size={16} /> No questions yet — be the first to ask.
            </p>
          )}
          {items?.map((q) => (
            <article key={q.id} className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">Q: {q.question}</p>
              <p className="mt-2 text-sm text-gray-700">
                <span className="font-semibold text-emerald-700">A:</span> {q.answer}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Asked by {q.userName} ·{" "}
                {new Date(q.createdAt).toLocaleDateString("en-BD", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </article>
          ))}
        </div>

        <form onSubmit={submit} className="mt-8 grid gap-3 border-t pt-6">
          <input
            type="text"
            name="_hp"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            style={{ display: "none" }}
            aria-hidden="true"
          />
          <h3 className="font-semibold">Ask about this laptop</h3>
          <label className="grid gap-1 text-sm">
            <span className="text-gray-600">Your name (optional)</span>
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              maxLength={60}
              className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-gray-600">Your question</span>
            <textarea
              required
              minLength={10}
              maxLength={500}
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Is the battery health above 80%?"
              className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={state === "sending"}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {state === "sending" && <Loader2 size={16} className="animate-spin" />}
              Submit question
            </button>
            <p aria-live="polite" className="text-sm">
              {state === "sent" && (
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 size={16} /> Thanks! We&apos;ll reply here once answered.
                </span>
              )}
              {state === "error" && <span className="text-red-600">{message}</span>}
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
