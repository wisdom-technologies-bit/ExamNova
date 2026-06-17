"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Upload, X, Loader2 } from "lucide-react"
import { uploadImage } from "@/app/actions/upload"
import { useToast } from "@/components/ui/use-toast"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  className?: string
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Set initial preview if value exists
  useEffect(() => {
    if (value) {
      console.log("Initial image value:", value)
      setPreviewUrl(null) // Clear any temporary preview
    }
  }, [value])

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File too large. Please select an image under 5MB")
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select an image under 5MB",
      })
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Invalid file type. Please select an image file")
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image file",
      })
      return
    }

    setIsUploading(true)

    try {
      // Create a temporary preview URL for immediate feedback
      const tempPreviewUrl = URL.createObjectURL(file)
      setPreviewUrl(tempPreviewUrl)

      console.log("Uploading image to Cloudinary...", file.name, file.size, file.type)

      // Upload to server
      const imageUrl = await uploadImage(file)
      console.log("Cloudinary upload result:", imageUrl)

      if (imageUrl) {
        // Update with the permanent URL from server
        onChange(imageUrl)
        toast({
          title: "Image uploaded",
          description: "Your image has been uploaded successfully",
        })
        console.log("Final image URL set:", imageUrl)
      } else {
        // Revert if upload fails
        setPreviewUrl(null)
        onChange("")
        setUploadError("Failed to upload image. Please try again.")
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: "Failed to upload image. Please try again.",
        })
      }
    } catch (error) {
      console.error("Image upload error:", error)
      setPreviewUrl(null)
      onChange("") // Clear on error
      setUploadError(`Upload error: ${error instanceof Error ? error.message : "Unknown error"}`)
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "An error occurred while uploading the image",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    onChange("")
    setUploadError(null)
  }

  // Determine which URL to display
  const displayUrl = previewUrl || value

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleChange}
        disabled={isUploading}
      />

      {displayUrl ? (
        <div className="relative">
          <Image
            src={displayUrl || "/placeholder.svg"}
            alt="Uploaded image"
            width={300}
            height={200}
            className="rounded-md object-cover w-full h-48"
            unoptimized={true}
          />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
            aria-label="Remove image"
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition-colors ${
            uploadError ? "border-red-500" : "border-gray-300"
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 text-gray-400 mb-2 animate-spin" />
              <p className="text-sm text-gray-500">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Click to upload an image</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</p>
              {uploadError && <p className="text-xs text-red-500 mt-2">{uploadError}</p>}
            </>
          )}
        </div>
      )}
    </div>
  )
}
