"use client";

import { useState } from "react";
import { createPost } from "../../actions/CreatePostAction";
import { uploadFile } from "../uploader";
import { useSearchParams, useRouter, redirect } from "next/navigation";
import { 
  Sparkles, FilePlus, MessageSquare, BookOpen, 
  FileText, Loader2, ArrowLeft, X, File, AlertCircle 
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { CornerLoadingOverlay } from "../../components/BlobWaiting";
import { TextPostSchema, DocPostSchema } from "@/schemas/post.schema";

type PostType = "question" | "answer" | "notes" | "question-paper";

/**
 * Accessible Field Wrapper
 * - Connects Label to Input
 * - Handles ARIA live-region for errors
 * - Maintains layout height to prevent "jitter"
 */
function FieldWrapper({
  label,
  error,
  id,
  children,
  optional = false,
}: {
  label: string;
  error?: string;
  id: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div className="space-y-2 w-full group">
      <div className="flex justify-between items-center ml-1">
        <label 
          htmlFor={id} 
          className="text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-fg-subtle))] group-focus-within:text-[rgb(var(--color-accent))] transition-colors"
        >
          {label}
        </label>
        {optional && (
          <span className="text-[9px] font-medium text-[rgb(var(--color-fg-muted))] uppercase tracking-tighter italic">Optional</span>
        )}
      </div>
      
      <div className="relative">
        {children}
      </div>

      <div className="min-h-[18px] transition-all"> 
        {error && (
          <p 
            id={`${id}-error`}
            role="alert"
            className="text-[10px] font-bold text-[rgb(var(--color-danger))] flex items-center gap-1.5 animate-in slide-in-from-top-1 duration-200"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default function NewPostPage() {

  
  const router = useRouter();

  const { data: session, status } = useSession();
  if (status === "loading") return <CornerLoadingOverlay isVisible={true} />;
  if (!session) {
    router.replace("/sign-in");
    return null;
  }
  
  const userId = session?.user._id;

  const [type, setType] = useState<PostType>("question");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string; type: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const searchParams = useSearchParams();
  const communityId = searchParams.get("communityId");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setFileDetails({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        type: file.type.split("/")[1]?.toUpperCase() || "DOC"
      });
      // Clear file error if user selects one
      setErrors(prev => {
        const { file, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateForm = async (formData: FormData): Promise<boolean> => {
    setErrors({});
    const fieldErrors: Record<string, string> = {};

    const title = (formData.get("title") as string)?.trim() || "";
    const subject = (formData.get("subject") as string)?.trim() || "";
    const content = (formData.get("content") as string)?.trim() || "";
    const summary = (formData.get("summary") as string)?.trim() || "";

    // Manual Logic for UX: Catch empty fields before Zod
    if (!title) fieldErrors.title = "Title is required";
    
    if ((type === "notes" || type === "question-paper") && !file) {
      fieldErrors.file = "Please upload a supporting document";
    }

    if ((type === "question" || type === "answer") && content.length < 10) {
      fieldErrors.content = "Please provide a more detailed explanation (min 10 chars)";
    }

    // Zod for Schema-Specific Constraints
    const basePayload = {
      title,
      type: type as any,
      subject: subject || undefined,
      community: communityId || null,
    };

    let result;
    if (type === "question" || type === "answer") {
      result = TextPostSchema.safeParse({ ...basePayload, content });
    } else {
      result = DocPostSchema.omit({ fileUrl: true }).safeParse({ ...basePayload, summary: summary || undefined });
    }

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        if (!fieldErrors[path]) fieldErrors[path] = issue.message;
      });
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return false;
    }
    return true;
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const isValid = await validateForm(formData);
    if (!isValid) return;

    setLoading(true);
    
    try {
      let fileUrl = "";
      if (file && (type === "notes" || type === "question-paper")) {
        fileUrl = await uploadFile(file);
      }

      const payload = {
        type,
        title: formData.get("title") as string,
        subject: formData.get("subject") as string,
        community: communityId || null,
        ...(type === "question" || type === "answer" 
            ? { content: formData.get("content") as string }
            : { fileUrl, summary: formData.get("summary") as string }
        )
      };

      const res = await createPost(payload as any);
      router.push(`/posts/${res._id}`);
    } catch (error) {
      console.error("Post creation failed:", error);
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] transition-colors duration-500 selection:bg-[rgb(var(--color-accent)/0.2)]">
      <div className="max-w-3xl mx-auto px-6 py-12 lg:py-20 pb-32">
        <CornerLoadingOverlay isVisible={loading} />
        
        <header className="flex flex-col items-center text-center space-y-6 mb-16">
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-fg-subtle))] hover:text-[rgb(var(--color-accent))] transition-colors"
          >
            <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
            Go Back
          </button>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-[rgb(var(--color-accent))] to-[rgb(var(--color-success))] rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative w-20 h-20 rounded-[2rem] bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))] flex items-center justify-center shadow-sm">
              <FilePlus className="w-8 h-8 text-[rgb(var(--color-accent))]" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
              New <span className="text-[rgb(var(--color-accent))]">Entry.</span>
            </h1>
            {communityId && (
              <p className="text-[rgb(var(--color-accent))] text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                Publishing to Community Space
              </p>
            )}
          </div>
        </header>

        <form id="post-form" onSubmit={handleSubmit} noValidate className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="p-8 md:p-12 rounded-[3rem] bg-[rgb(var(--color-bg-soft)/0.4)] border border-[rgb(var(--color-border)/0.5)] backdrop-blur-xl shadow-sm space-y-10">
            
            {/* Type Selector */}
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-fg-subtle))] ml-1">Classification</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3" role="radiogroup">
                {[
                  { id: "question", icon: MessageSquare, label: "Question" },
                  { id: "answer", icon: Sparkles, label: "Answer" },
                  { id: "notes", icon: BookOpen, label: "Notes" },
                  { id: "question-paper", icon: FileText, label: "Paper" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setType(item.id as PostType);
                      setErrors({});
                    }}
                    aria-checked={type === item.id}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${
                      type === item.id 
                        ? "bg-[rgb(var(--color-fg))] border-[rgb(var(--color-fg))] text-[rgb(var(--color-bg))] shadow-lg scale-105" 
                        : "bg-[rgb(var(--color-bg))] border-[rgb(var(--color-border)/0.5)] text-[rgb(var(--color-fg-muted))] hover:border-[rgb(var(--color-accent))]"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              {/* Title & Subject */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <FieldWrapper label="Headline" error={errors.title} id="title">
                    <input
                      id="title"
                      name="title"
                      placeholder="Briefly describe your entry..."
                      aria-invalid={!!errors.title}
                      aria-describedby={errors.title ? "title-error" : undefined}
                      className={`w-full bg-transparent border-0 border-b px-0 py-3 transition-all text-xl font-bold outline-none
                        ${errors.title 
                          ? "border-[rgb(var(--color-danger))] text-[rgb(var(--color-danger))] placeholder:text-[rgb(var(--color-danger)/0.4)]" 
                          : "border-[rgb(var(--color-border)/0.5)] focus:border-[rgb(var(--color-accent))]"
                        }`}
                    />
                  </FieldWrapper>
                </div>
                <FieldWrapper label="Subject" error={errors.subject} id="subject" optional>
                  <input
                    id="subject"
                    name="subject"
                    placeholder="e.g. Physics"
                    className="w-full bg-transparent border-0 border-b border-[rgb(var(--color-border)/0.5)] px-0 py-3 focus:border-[rgb(var(--color-accent))] transition-all text-xl font-bold outline-none"
                  />
                </FieldWrapper>
              </div>

              {/* Conditional: Text Content */}
              {(type === "question" || type === "answer") && (
                <div className="animate-in fade-in zoom-in-95">
                  <FieldWrapper label="Content" error={errors.content} id="content">
                    <textarea
                      id="content"
                      name="content"
                      rows={8}
                      placeholder="Type your thoughts here..."
                      aria-invalid={!!errors.content}
                      aria-describedby={errors.content ? "content-error" : undefined}
                      className={`w-full bg-[rgb(var(--color-bg-soft)/0.5)] border rounded-2xl p-6 transition-all text-base font-medium outline-none resize-none
                        ${errors.content 
                          ? "border-[rgb(var(--color-danger))] shadow-[0_0_20px_rgba(var(--color-danger),0.05)]" 
                          : "border-[rgb(var(--color-border)/0.5)] focus:border-[rgb(var(--color-accent))]"
                        }`}
                    />
                  </FieldWrapper>
                </div>
              )}

              {/* Conditional: Document Upload */}
              {(type === "notes" || type === "question-paper") && (
                <div className="space-y-8 animate-in fade-in zoom-in-95">
                  <FieldWrapper label="Document Source" error={errors.file} id="file-upload">
                    {!fileDetails ? (
                      <div className="relative group/file">
                        <input
                          id="file-upload"
                          type="file"
                          name="file"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.ppt"
                          onChange={handleFileChange}
                          className="w-full h-32 opacity-0 absolute inset-0 cursor-pointer z-10"
                        />
                        <div className={`w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all bg-[rgb(var(--color-bg-soft)/0.2)]
                          ${errors.file ? "border-[rgb(var(--color-danger))]" : "border-[rgb(var(--color-border)/0.5)] group-hover/file:border-[rgb(var(--color-accent))]"}`}>
                          <FileText className={`w-6 h-6 mb-2 ${errors.file ? "text-[rgb(var(--color-danger))]" : "text-[rgb(var(--color-fg-subtle))]"}`} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-fg-subtle))]">Click or Drag File</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-accent))] rounded-2xl animate-in zoom-in-95">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[rgb(var(--color-accent)/0.1)] rounded-xl flex items-center justify-center">
                            <File className="w-6 h-6 text-[rgb(var(--color-accent))]" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold truncate max-w-[200px]">{fileDetails.name}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[rgb(var(--color-fg))] text-[rgb(var(--color-bg))]">{fileDetails.type}</span>
                                <span className="text-[10px] text-[rgb(var(--color-fg-subtle))]">{fileDetails.size}</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => { setFileDetails(null); setFile(null); }}
                          className="p-2 hover:bg-[rgb(var(--color-danger)/0.1)] text-[rgb(var(--color-danger))] rounded-full transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </FieldWrapper>

                  <FieldWrapper label="Executive Summary" error={errors.summary} id="summary" optional>
                    <textarea
                      id="summary"
                      name="summary"
                      rows={5}
                      placeholder="Summarize the resource for others..."
                      className="w-full bg-[rgb(var(--color-bg-soft)/0.5)] border border-[rgb(var(--color-border)/0.5)] rounded-2xl p-6 focus:border-[rgb(var(--color-accent))] transition-all text-base font-medium outline-none resize-none"
                    />
                  </FieldWrapper>
                </div>
              )}
            </div>

            {/* Actions */}
            <footer className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-[rgb(var(--color-border)/0.5)]">
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-[rgb(var(--color-fg))] text-[rgb(var(--color-bg))] hover:bg-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-fg))] font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? "Processing..." : "Publish Entry"}
              </button>
              
              <Link 
                href={`/dashboard/${userId}`}
                className="flex items-center justify-center px-8 py-4 bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border)/0.5)] text-[rgb(var(--color-fg-muted))] hover:text-[rgb(var(--color-fg))] font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all"
              >
                Dismiss
              </Link>
            </footer>
          </div>
        </form>
      </div>
    </div>
  );
}