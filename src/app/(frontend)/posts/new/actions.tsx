// app/posts/new/actions.ts
"use server"

import fs from "node:fs/promises"
import path from "node:path"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import postService from "@/services/post.service"
import { TextPostSchema, DocPostSchema } from "@/schemas/post.schema"

export async function createPost(formData: FormData) {
  const currentSession = await getServerSession(authOptions)
  if (!currentSession?.user?._id) redirect("/login")

  const type = formData.get("type") as string
  const subject = (formData.get("subject") as string) || null
  const title = (formData.get("title") as string) || ""
  const content = (formData.get("content") as string) || ""
  const summary = (formData.get("summary") as string) || null

  if (type === "question" || type === "answer") {
    const data = TextPostSchema.parse({
      title,
      content,
      subject,
      type,
      community: null,
    })
    const created = await postService.createTextPost(currentSession.user._id, data)
    redirect(`/posts/${created._id}`)
  }

  if (type === "notes" || type === "question-paper") {
    const file = formData.get("file") as File | null
    if (!file) redirect("/posts/new")

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await fs.mkdir(uploadDir, { recursive: true })
    const fileName = `${Date.now()}-${file.name}`
    const filePath = path.join(uploadDir, fileName)
    await fs.writeFile(filePath, buffer)

    const fileUrl = `/uploads/${fileName}`

    const data = DocPostSchema.parse({
      title,
      summary,
      fileUrl,
      subject,
      type,
      community: null,
    })

    const created = await postService.createDocPost(currentSession.user._id, data)
    redirect(`/posts/${created._id}`)
  }

  redirect("/posts/new")
}
