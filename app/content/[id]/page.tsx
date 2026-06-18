"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function ContentPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { pin?: string }
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [subject, setSubject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const pin = searchParams.pin
  const subjectId = params.id

  // Disable right-click
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    document.addEventListener("contextmenu", handleContextMenu)

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
    }
  }, [])

  // Disable copy
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      return false
    }

    document.addEventListener("copy", handleCopy)

    return () => {
      document.removeEventListener("copy", handleCopy)
    }
  }, [])

  // Disable print
  useEffect(() => {
    const handlePrint = () => {
      toast({
        variant: "destructive",
        title: "Printing Disabled",
        description: "Printing is disabled for this content.",
      })
      return false
    }

    window.addEventListener("beforeprint", handlePrint)

    return () => {
      window.removeEventListener("beforeprint", handlePrint)
    }
  }, [toast])

  // Fetch subject content
  useEffect(() => {
    async function fetchSubject() {
      if (!pin) {
        setError("No PIN provided")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/content?subjectId=${subjectId}&pin=${pin}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "Failed to load content")
          setLoading(false)
          return
        }

        setSubject(data.subject)
        setLoading(false)
      } catch (error) {
        setError("Failed to load content")
        setLoading(false)
      }
    }

    fetchSubject()
  }, [pin, subjectId])

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-10">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Relax expo is loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !subject) {
    return (
      <div className="container py-10">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Lock className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              {error || "Invalid or expired PIN. Please purchase this subject to access the content."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Link href="/pin">
              <Button variant="outline">Try Another PIN</Button>
            </Link>
            <Link href="/">
              <Button className="bg-green-600 hover:bg-green-700">Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-10">
      <Link href="/" className="flex items-center text-green-600 hover:text-green-700 mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{subject.title}</CardTitle>
          <CardDescription>
            {subject.subcategory_name} - {subject.category_name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subject.image_url && (
            <div className="mb-6">
              <Image
                src={subject.image_url || "/placeholder.svg"}
                alt={subject.title}
                width={800}
                height={400}
                className="rounded-md object-cover w-full max-h-96"
              />
            </div>
          )}

          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: subject.content }} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
