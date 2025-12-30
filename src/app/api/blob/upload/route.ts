import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  console.log(body);
  
  const result = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async (pathname, clientPayload) => ({
      allowedContentTypes: [        
        "application/pdf",
        "application/ppt",
        "application/doc",
        "image/*",], 
      maxSize: 1024 * 1024 * 1024 * 2,
    }),
    onUploadCompleted: async ({ blob, tokenPayload }) => {
    },
  });

  return NextResponse.json(result);
}
