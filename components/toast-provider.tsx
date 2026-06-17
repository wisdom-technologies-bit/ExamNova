"use client"

import { Toaster } from "@/components/ui/toaster"
import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

export function ToastProvider() {
  const { toast } = useToast()

  // Test toast on mount in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // Uncomment this to test toast notifications
      // toast({
      //   title: "Toast Notification System",
      //   description: "Toast notifications are working correctly.",
      //   duration: 3000,
      // })
      console.log("Toast provider mounted")
    }
  }, [toast])

  return <Toaster />
}
