"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormStatus } from 'react-dom';
import { uploadFile } from "../../uploader";
import { getPostAction, updatePostAction } from "../../../actions/updatePostAction";
import type { Post } from "@/app/types/post";
import { CornerLoadingOverlay } from "@/app/(frontend)/components/BlobWaiting";
import { ArrowLeft, FileText, Sparkles, Paperclip } from "lucide-react";
import { use } from "react";

export default function EditPostPage({
  params,
}: {
  params: Promise<{ _id: string }>;
}) {
  const router = useRouter();
  const { _id } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const p = await getPostAction(_id);
      if (!p) {
        router.push("/posts");
        return;
      }
      setPost(p);
    })();
  }, [_id, router]);

  if (!post) {
    return <CornerLoadingOverlay isVisible={true} />;
  }

  // ✅ ZOD VALIDATION FUNCTION
  const validateForm = (formData: FormData) => {
    const title = formData.get("title") as string;
    
    if (!title || title.length < 1) {
      setErrors({ title: "Title required" });
      return false;
    }
    if (title.length > 200) {
      setErrors({ title: "Title too long (max 200 chars)" });
      return false;
    }

    const isDoc = post.type === "notes" || post.type === "question-paper";
    if (isDoc) {
      const summary = formData.get("summary") as string;
      // Summary is optional, no strict validation needed
    } else {
      const content = formData.get("content") as string;
      if (!content || content.length < 10) {
        setErrors({ content: "Content too short (min 10 chars)" });
        return false;
      }
      if (content.length > 10000) {
        setErrors({ content: "Content too long (max 10k chars)" });
        return false;
      }
    }

    setErrors({});
    return true;
  };

  const uploadHandler = async (formData: FormData) => {
    // ✅ VALIDATE BEFORE UPLOAD
    if (!validateForm(formData)) {
      return;
    }

    setLoading(true);
    const file = formData.get("file") as File | null;
    let fileUrl: string | null = null;

    if (file && file.size > 0) {
      fileUrl = await uploadFile(file);
      formData.set("fileUrl", fileUrl);
    } else {
      formData.delete("fileUrl");
    }

    formData.set("_id", _id);
    await updatePostAction(formData);
    setLoading(false);
  };

  const isDoc = post.type === "notes" || post.type === "question-paper";

  function SubmitButton() {
    const { pending } = useFormStatus();
    return (
      <>
        <CornerLoadingOverlay isVisible={pending || loading} />
        <button
          disabled={pending || loading}
          type="submit"
          className="flex-1 px-8 py-4 bg-[rgb(var(--color-accent))] text-[rgb(var(--color-accent-fg))] font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
        >
          {pending || loading ? 'Synchronizing...' : 'Update Entry'}
        </button>
      </>
    );
  }

  // ✅ ERROR DISPLAY COMPONENT
  const ErrorMessage = ({ field }: { field: string }) => {
    if (!errors[field]) return null;
    return (
      <p className="text-[10px] text-[rgb(var(--color-danger))] font-bold mt-1 ml-1 animate-in fade-in">
        {errors[field]}
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] transition-colors duration-500">
      <div className="max-w-3xl mx-auto px-6 py-12 lg:py-20">
        
        {/* Header Section - UNCHANGED */}
        <header className="flex flex-col items-center text-center space-y-6 mb-16">
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-fg-subtle))] hover:text-[rgb(var(--color-accent))] transition-colors"
          >
            <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
            Go Back
          </button>

          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
              Modify <span className="text-[rgb(var(--color-accent))]">Post.</span>
            </h1>
            <p className="text-[rgb(var(--color-fg-muted))] text-sm font-medium tracking-tight">
              Refining content for the knowledge space
            </p>
          </div>
        </header>

        <form
          className="p-8 md:p-12 rounded-[3rem] bg-[rgb(var(--color-bg-soft)/0.4)] border border-[rgb(var(--color-border)/0.5)] backdrop-blur-xl shadow-sm space-y-10"
          action={uploadHandler}
          encType="multipart/form-data"
        >
          <input type="hidden" name="_id" value={_id} />

          <div className="space-y-8">
            {/* Title & Subject Grid - WITH VALIDATION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 group relative">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-fg-subtle))] ml-1">Headline</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={post.title}
                  required
                  className={`w-full bg-transparent border-0 border-b border-[rgb(var(--color-border)/0.5)] rounded-none px-0 py-3 focus:border-[rgb(var(--color-accent))] transition-all text-xl font-bold outline-none placeholder-[rgb(var(--color-fg-subtle)/0.5)] ${
                    errors.title ? 'border-[rgb(var(--color-danger))]' : ''
                  }`}
                  placeholder="Post title..."
                />
                <ErrorMessage field="title" />
              </div>
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-fg-subtle))] ml-1">Subject Area</label>
                <input
                  type="text"
                  name="subject"
                  defaultValue={post.subject || ""}
                  className="w-full bg-transparent border-0 border-b border-[rgb(var(--color-border)/0.5)] rounded-none px-0 py-3 focus:border-[rgb(var(--color-accent))] transition-all text-xl font-bold outline-none placeholder-[rgb(var(--color-fg-subtle)/0.5)]"
                  placeholder="e.g. Physics"
                />
              </div>
            </div>

            {/* Content / Summary Area - WITH VALIDATION */}
            <div className="relative space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-fg-subtle))] ml-1">
                {isDoc ? "Executive Summary" : "Body Content"}
              </label>
              <textarea
                name={isDoc ? "summary" : "content"}
                defaultValue={isDoc ? (post as any).summary ?? "" : (post as any).content ?? ""}
                rows={10}
                className={`w-full bg-[rgb(var(--color-bg-soft)/0.5)] border border-[rgb(var(--color-border)/0.5)] rounded-2xl p-6 focus:border-[rgb(var(--color-accent))] transition-all text-base font-medium outline-none resize-none placeholder-[rgb(var(--color-fg-subtle)/0.5)] ${
                  errors[isDoc ? "summary" : "content"] ? 'border-[rgb(var(--color-danger))] bg-[rgb(var(--color-danger)/0.02)]' : ''
                }`}
                placeholder="Share your updated insights..."
              />
              <ErrorMessage field={isDoc ? "summary" : "content"} />
            </div>

            {/* File Management (Conditional) - UNCHANGED */}
            {isDoc && (
              <div className="space-y-4 pt-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-fg-subtle))] ml-1">Attached Document</label>
                
                <div className="relative group/file overflow-hidden rounded-2xl border-2 border-dashed border-[rgb(var(--color-border)/0.5)] hover:border-[rgb(var(--color-accent))] transition-all bg-[rgb(var(--color-bg-soft)/0.2)]">
                  {"fileUrl" in post && post.fileUrl ? (
                    <div className="p-8 flex flex-col items-center gap-4 text-center">
                      <div className="w-16 h-16 bg-[rgb(var(--color-accent)/0.1)] rounded-2xl flex items-center justify-center">
                        <FileText className="w-8 h-8 text-[rgb(var(--color-accent))]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[rgb(var(--color-fg))]">Existing Document Loaded</p>
                        <a href={post.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-accent))] hover:underline">
                          Preview File
                        </a>
                      </div>
                      <input type="file" name="file" accept="application/pdf" className="hidden" id="file-replace" />
                      <label htmlFor="file-replace" className="mt-2 inline-flex px-6 py-2 bg-[rgb(var(--color-fg))] text-[rgb(var(--color-bg))] text-[9px] font-black uppercase tracking-widest rounded-full cursor-pointer hover:bg-[rgb(var(--color-accent))] transition-all shadow-sm">
                        Replace Attachment
                      </label>
                    </div>
                  ) : (
                    <div className="p-12 flex flex-col items-center justify-center gap-3">
                      <Paperclip className="w-6 h-6 text-[rgb(var(--color-fg-subtle))]" />
                      <input type="file" name="file" accept="application/pdf" className="absolute inset-0 opacity-0 cursor-pointer" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-fg-subtle))]">Upload PDF Resource</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions - UNCHANGED */}
          <footer className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-[rgb(var(--color-border)/0.5)]">
            <a
              href={`/posts/${_id}`}
              className="flex-1 flex items-center justify-center px-8 py-4 bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border)/0.5)] text-[rgb(var(--color-fg-muted))] hover:text-[rgb(var(--color-fg))] font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all"
            >
              Dismiss Changes
            </a>
            <SubmitButton />
          </footer>
        </form>

        <div className="mt-12 text-center group">
          <p className="text-xs text-[rgb(var(--color-fg-subtle))]">
            Revision required? {" "}
            <a
              href={`/posts/${_id}`}
              className="text-[rgb(var(--color-accent))] font-bold hover:underline"
            >
              View original post
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
