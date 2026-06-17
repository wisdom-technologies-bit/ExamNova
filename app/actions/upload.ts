"use server"

import { uploadImage as cloudinaryUpload, deleteImage as cloudinaryDelete } from "@/lib/cloudinary"
import { logger } from "@/lib/logger"

// app/actions/upload.ts

export async function uploadImage(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"; // fallback in dev

  const res = await fetch(`${baseUrl}/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    console.error("Upload failed:", res.statusText);
    return null;
  }

  const data = await res.json();
  return data.url as string;
}

export async function deleteImage(url: string): Promise<boolean> {
  try {
    logger.info(`[UPLOAD] Deleting image: ${url}`)
    const result = await cloudinaryDelete(url)

    if (result) {
      logger.info(`[UPLOAD] Image deleted successfully: ${url}`)
    } else {
      logger.error(`[UPLOAD] Failed to delete image: ${url}`)
    }

    return result
  } catch (error) {
    logger.error(`[UPLOAD] Error in deleteImage server action: ${error instanceof Error ? error.message : error}`)
    return false
  }
}
