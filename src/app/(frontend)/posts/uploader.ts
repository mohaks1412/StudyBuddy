import { upload } from "@vercel/blob/client";

export async function uploadFile(file: File) {
    
  const blob = await upload(Date.now()+file.name, file, {
    handleUploadUrl: "/api/blob/upload",
    access: "public",
    multipart: true, // needed for large files
    
  });
  
  return blob.url
}
