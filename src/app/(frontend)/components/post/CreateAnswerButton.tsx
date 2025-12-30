"use client";

import { useState } from "react";
import { useFormStatus } from 'react-dom'; // ADD THIS
import { ConfirmOverlay } from "@/app/(frontend)/components/ConfirmOverlay";
import { createAnswerAction } from "@/app/(frontend)/actions/createAnswerAction";
import { MessageSquarePlus, Sparkles, Loader2 } from "lucide-react";
import { CornerLoadingOverlay } from "../BlobWaiting";

type CreateAnswerButtonProps = {
  questionId: string;
  questionTitle: string;
  subject?: string | null;
};

export function CreateAnswerButton({
  questionId,
  questionTitle,
  subject,
}: CreateAnswerButtonProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    try {
      setSubmitting(true);
      setError(null);

      formData.set("questionId", questionId);
      await createAnswerAction(formData);
      setOpen(false);
      setSubmitting(false);
    } catch (e: any) {
      setError(e?.message || "Failed to submit answer");
      setSubmitting(false);
    }
  }

  // ADD THIS: Inner component for useFormStatus
  function SubmitTrigger() {
    const { pending } = useFormStatus();
    return <CornerLoadingOverlay isVisible={pending || submitting} />;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          group inline-flex items-center gap-2 px-6 py-3 rounded-2xl 
          bg-[rgb(var(--color-fg))] text-[rgb(var(--color-bg))] 
          hover:bg-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-fg))] 
          text-sm font-black uppercase tracking-widest transition-all shadow-xl active:scale-95
        "
      >
        <MessageSquarePlus className="w-4 h-4 transition-transform group-hover:scale-110" />
        <span>Contribute Answer</span>
      </button>

      <ConfirmOverlay
        open={open}
        title="Formulate Insight"
        description={
          <form
            id="answer-form"
            action={handleSubmit}
            className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500"
          >
            {/* Context Header */}
            <div className="p-4 rounded-2xl bg-[rgb(var(--color-bg-soft)/0.5)] border border-[rgb(var(--color-border)/0.5)]">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-fg-subtle))] opacity-60 mb-1">
                Responding to
              </p>
              <h4 className="text-sm font-bold text-[rgb(var(--color-fg))] truncate mb-2">
                {questionTitle}
              </h4>
              {subject && (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[rgb(var(--color-accent)/0.1)] text-[rgb(var(--color-accent))] text-[9px] font-black uppercase tracking-widest border border-[rgb(var(--color-accent)/0.2)]">
                  {subject}
                </div>
              )}
            </div>

            {/* Studio Input Area */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-accent))] ml-1">
                Your Contribution
              </label>
              <textarea
                name="content"
                rows={6}
                required
                placeholder="Provide a detailed explanation or solution..."
                className="
                  w-full px-5 py-4 rounded-[2rem] 
                  bg-[rgb(var(--color-bg-soft)/0.5)] border border-[rgb(var(--color-border)/0.5)] 
                  text-[rgb(var(--color-fg))] placeholder-[rgb(var(--color-fg-subtle))/0.4]
                  focus:ring-2 focus:ring-[rgb(var(--color-accent)/0.2)] focus:border-[rgb(var(--color-accent))]
                  transition-all outline-none resize-none text-base font-medium
                "
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[rgb(var(--color-danger)/0.1)] border border-[rgb(var(--color-danger)/0.2)]">
                <p className="text-xs font-bold text-[rgb(var(--color-danger))] uppercase tracking-tight">
                  {error}
                </p>
              </div>
            )}

            {/* ADD THIS: Invisible trigger for useFormStatus */}
            <SubmitTrigger />
          </form>
        }
        onCancel={() => {
          if (!submitting) setOpen(false);
        }}
        cancelLabel="Discard"
        primaryLabel={submitting ? "Submitting..." : "Publish Insight"}
        primaryOnClick={() => {
          const form = document.querySelector("#answer-form") as HTMLFormElement | null;
          form?.requestSubmit();
        }}
        primaryVariant="primary"
      />
    </>
  );
}
