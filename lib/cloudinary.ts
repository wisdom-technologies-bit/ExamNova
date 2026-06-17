"use server"

import { v2 as cloudinary } from "cloudinary"
import { env } from "@/lib/env"
import { logger } from "@/lib/logger"

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(base64: string): Promise<string | null> {
  try {
      logger.info(`[CLOUDINARY] Uploading base64 image to Cloudinary...`);

          const result = await new Promise<any>((resolve, reject) => {
                 cloudinary.uploader.upload(
                   base64,
                                {
                                          folder: "examnova",
                                                    resource_type: "auto",
                                                            },
                                                                    (error, result) => {
                                                                              if (error) {
                                                                                          logger.error(`[CLOUDINARY] Upload error: ${JSON.stringify(error)}`);
                                                                                                      reject(error);
                                                                                                                } else {
                                                                                                                            resolve(result);
                                                                                                                                      }
                                                                                                                                              }
                                                                                                                                                    );
                                                                                                                                                        });

                                                                                                                                                            logger.info(`[CLOUDINARY] Upload successful: ${result.secure_url}`);
                                                                                                                                                                return result.secure_url;
                                                                                                                                                                  } catch (error) {
                                                                                                                                                                      logger.error(`[CLOUDINARY] Error in uploadImage: ${error instanceof Error ? error.message : error}`);
                                                                                                                                                                          return null;
                                                                                                                                                                            }
                                                                                                                                                                            }

export async function deleteImage(url: string): Promise<boolean> {
  try {
    // Extract public_id from URL
    const publicId = extractPublicId(url)
    if (!publicId) {
      logger.error(`[CLOUDINARY] Could not extract public_id from URL: ${url}`)
      return false
    }

    logger.info(`[CLOUDINARY] Deleting image with public_id: ${publicId}`)

    // Delete from Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          logger.error(`[CLOUDINARY] Delete error: ${JSON.stringify(error)}`)
          reject(error)
        } else {
          resolve(result)
        }
      })
    })

    logger.info(`[CLOUDINARY] Delete result: ${JSON.stringify(result)}`)
    return result.result === "ok"
  } catch (error) {
    logger.error(`[CLOUDINARY] Error in deleteImage: ${error instanceof Error ? error.message : error}`)
    return false
  }
}

// Helper function to convert File to base64
function fileToBase64(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      logger.info(`[CLOUDINARY] File converted to base64 successfully`)
      resolve(reader.result as string)
    }
    reader.onerror = () => {
      logger.error(`[CLOUDINARY] FileReader error: ${reader.error}`)
      resolve(null)
    }
  })
}

// Helper function to extract public_id from Cloudinary URL
function extractPublicId(url: string): string | null {
  try {
    // Example URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/examnova/image.jpg
    const urlParts = url.split("/")
    const filename = urlParts[urlParts.length - 1]
    const folderName = urlParts[urlParts.length - 2]

    // Remove file extension
    const publicIdWithoutExt = filename.split(".")[0]

    // Combine folder and filename
    return `${folderName}/${publicIdWithoutExt}`
  } catch (error) {
    logger.error(`[CLOUDINARY] Error extracting public_id: ${error instanceof Error ? error.message : error}`)
    return null
  }
}
