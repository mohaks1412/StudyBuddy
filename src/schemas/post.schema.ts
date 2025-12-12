import { z } from "zod"

export const TextPostSchema = z.object({
  title: z.string().min(1, "Title required").max(200),
  content: z.string().min(10, "Content too short").max(10000),
  type: z.enum(["question", "answer"]),
  subject: z.string().optional(),
  community: z.string().optional().nullable(),
})

export const DocPostSchema = z.object({
  title: z.string().min(1, "Title required").max(200),
  summary: z.string().optional(),
  fileUrl: z.string().url({ message: "Valid URL required" }),
  type: z.enum(["question-paper", "notes"]),
  subject: z.string().optional(),
  community: z.string().optional().nullable(),
})
