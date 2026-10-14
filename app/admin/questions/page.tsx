"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/ToastContext";
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Send,
  Loader2,
  ExternalLink,
  MessageCircleQuestion,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface QuestionItem {
  id: string;
  productSlug: string;
  userName: string;
  question: string;
  answer: string | null;
  createdAt: string;
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unanswered" | "answered">("unanswered");
  const [editingAnswers, setEditingAnswers] = useState<Record<string, string>>({});
  const [submittingIds, setSubmittingIds] = useState<Record<string, boolean>>({});
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});

  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/questions");
      if (!res.ok) throw new Error("Failed to load questions");
      const data = await res.json();
      setQuestions(Array.isArray(data) ? data : []);
      
      // Initialize editing answers
      const initialAnswers: Record<string, string> = {};
      if (Array.isArray(data)) {
        data.forEach((q) => {
          if (q.answer) {
            initialAnswers[q.id] = q.answer;
          }
        });
      }
      setEditingAnswers(initialAnswers);
    } catch (err: any) {
      console.error(err);
      showErrorToast("Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAnswerSubmit = async (id: string) => {
    const answerText = editingAnswers[id] ?? "";
    if (!answerText.trim()) {
      showErrorToast("Please type an answer before saving");
      return;
    }

    setSubmittingIds((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: answerText.trim() }),
      });

      if (!res.ok) throw new Error("Failed to save answer");

      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, answer: answerText.trim() } : q))
      );
      showSuccessToast("Answer published successfully");
    } catch (err: any) {
      console.error(err);
      showErrorToast("Failed to publish answer");
    } finally {
      setSubmittingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    setDeletingIds((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete question");

      setQuestions((prev) => prev.filter((q) => q.id !== id));
      showSuccessToast("Question deleted");
    } catch (err: any) {
      console.error(err);
      showErrorToast("Failed to delete question");
    } finally {
      setDeletingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch =
        q.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.productSlug.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all"
          ? true
          : filterStatus === "unanswered"
          ? !q.answer
          : Boolean(q.answer);

      return matchesSearch && matchesStatus;
    });
  }, [questions, searchTerm, filterStatus]);

  const unansweredCount = useMemo(
    () => questions.filter((q) => !q.answer).length,
    [questions]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-lg border border-border shadow-2xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Product Q&A Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Answer questions from customers about product specifications, warranty, and availability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchQuestions}
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by customer name, question, or product slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterStatus("unanswered")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              filterStatus === "unanswered"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Unanswered ({unansweredCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus("answered")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              filterStatus === "answered"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Answered
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filterStatus === "all"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({questions.length})
          </button>
        </div>
      </div>

      {/* Questions List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-card border border-border rounded-lg text-muted-foreground gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs font-medium">Loading questions...</p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center bg-card border border-border rounded-lg text-muted-foreground gap-2">
          <MessageCircleQuestion className="w-10 h-10 stroke-[1.5] text-muted-foreground/60" />
          <p className="text-sm font-semibold">No questions found</p>
          <p className="text-xs text-muted-foreground">
            {filterStatus === "unanswered"
              ? "All customer questions have been answered! Great job."
              : "No questions match your current search or filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const isSubmitting = Boolean(submittingIds[q.id]);
            const isDeleting = Boolean(deletingIds[q.id]);
            const currentAnswerInput = editingAnswers[q.id] ?? "";
            const isAnswered = Boolean(q.answer);

            return (
              <div
                key={q.id}
                className="bg-card border border-border rounded-lg p-5 shadow-2xs flex flex-col gap-3 transition-colors hover:border-border/80"
              >
                {/* Question Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-foreground">
                      {q.userName}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      on {new Date(q.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isAnswered
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {isAnswered ? "Answered" : "Pending Answer"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/products/${q.productSlug}`}
                      target="_blank"
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold"
                    >
                      <span>View Product</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(q.id)}
                      disabled={isDeleting}
                      className="text-muted-foreground hover:text-red-600 p-1 rounded-sm transition-colors cursor-pointer"
                      title="Delete question"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Question Body */}
                <div className="text-sm font-semibold text-foreground flex items-start gap-2">
                  <span className="text-blue-600 font-extrabold shrink-0">Q:</span>
                  <p className="leading-relaxed">{q.question}</p>
                </div>

                {/* Answer Box */}
                <div className="bg-muted/40 p-3.5 rounded-md border border-border/60 space-y-2 mt-1">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span className="text-emerald-600 font-extrabold">A:</span>
                    <span>Admin Response:</span>
                  </label>
                  <textarea
                    rows={2}
                    value={currentAnswerInput}
                    onChange={(e) =>
                      setEditingAnswers((prev) => ({
                        ...prev,
                        [q.id]: e.target.value,
                      }))
                    }
                    placeholder="Type official store response here (e.g., 'Yes, this laptop comes with 2 years official warranty and 15 days replacement')..."
                    className="w-full text-xs p-2.5 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={() => handleAnswerSubmit(q.id)}
                      disabled={isSubmitting}
                      className="text-xs font-bold flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Send className="w-3 h-3" />
                      )}
                      <span>{isAnswered ? "Update Answer" : "Publish Answer"}</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
