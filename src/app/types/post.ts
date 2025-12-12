import { z } from "zod"
import { TextPostSchema, DocPostSchema } from "@/schemas/post.schema"

export type TextPostCreateData = z.infer<typeof TextPostSchema>
export type DocPostCreateData = z.infer<typeof DocPostSchema>

export interface TextPost {
  _id: string
  authorId: { _id: string; username: string; email: string }
  title: string
  content: string
  type: "question" | "answer"
  subject: string | null
  associate: TextPost[] // answers for questions
  community: string | null 
  createdAt: Date
  updatedAt: Date
}

export interface DocPost {
  _id: string
  authorId: { _id: string; username: string; email: string }
  title: string
  summary: string | null
  fileUrl: string
  type: "question-paper" | "notes"
  subject: string | null
  community: string | null 
  createdAt: Date
  updatedAt: Date
}

export type Post = TextPost | DocPost
export type PostId = string
