// app/posts/new/page.tsx
"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom" // Import useFormStatus for pending state
import type { FormEvent } from "react"
import { createPost } from "./actions"

type PostType = "question" | "answer" | "notes" | "question-paper"

// Helper component for the submit button to show loading state
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`
        w-full px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg text-white
        ${pending 
          ? "bg-teal-800 text-gray-400 cursor-not-allowed" 
          : "bg-teal-600 hover:bg-teal-700 hover:shadow-teal-500/50"
        }
      `}
    >
      {pending ? "Publishing..." : "Publish Post"}
    </button>
  );
}

// Helper component for styled inputs
interface FormFieldProps {
    label: string;
    children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, children }) => (
    <div>
        <label className="block text-xs font-semibold uppercase text-gray-400 tracking-wider mb-2">
            {label}
        </label>
        {children}
    </div>
);

export default function NewPostPage() {
  const [type, setType] = useState<PostType>("question")

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10 bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl">
      <h1 className="text-3xl font-extrabold text-teal-400 border-b border-gray-700/50 pb-4 mb-8">
        Create a New Post
      </h1>

      <form
        action={createPost}
        className="space-y-8" // Increased overall spacing
        encType="multipart/form-data"
      >
        {/* Type and Subject Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="Post Type">
            <select
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value as PostType)}
              className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors" // Enhanced styling
            >
              <option value="question">Question</option>
              <option value="answer">Answer / Solution</option>
              <option value="notes">Notes (Document Upload)</option>
              <option value="question-paper">Question Paper (Document Upload)</option>
            </select>
          </FormField>

          <FormField label="Subject/Topic">
            <input
              name="subject"
              placeholder="e.g., Maths, Physics, DBMS"
              className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm placeholder-gray-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors" // Enhanced styling
            />
          </FormField>
        </div>

        {/* Title Section */}
        <FormField label="Title">
          <input
            name="title"
            placeholder="A clear and concise title"
            className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm placeholder-gray-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors" // Enhanced styling
            required
          />
        </FormField>

        {/* Content/Text Area (Question or Answer) */}
        {(type === "question" || type === "answer") && (
          <FormField label={`Content (${type === "question" ? "Explain your question in detail" : "Provide the solution or answer"})`}>
            <textarea
              name="content"
              rows={8} // Increased rows for better visual height
              className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm placeholder-gray-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors" // Enhanced styling
              placeholder="Write your post content here..."
            />
          </FormField>
        )}

        {/* Document Upload Section (Notes or Question Paper) */}
        {(type === "notes" || type === "question-paper") && (
          <div className="grid gap-6 md:grid-cols-2">
            <FormField label="Upload Document (PDF, DOCX, Images)">
              <input
                type="file"
                name="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                className="w-full text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-teal-700 transition-colors file:cursor-pointer" // File input styling enhanced
              />
            </FormField>

            <FormField label="Summary (Describe the document)">
              <textarea
                name="summary"
                rows={5}
                placeholder="Briefly describe the contents of your document."
                className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm placeholder-gray-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
              />
            </FormField>
          </div>
        )}

        <SubmitButton />
      </form>
    </div>
  )
}