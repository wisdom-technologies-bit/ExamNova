import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function ContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ pin?: string }>
}) {
  const { id: subjectId } = await params
  const { pin } = await searchParams

  // Validate PIN is provided
  if (!pin) {
    return (
      <div className="container py-10">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center mb-4">
            <Lock className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">Access Denied</h1>
          <p className="text-center text-muted-foreground mb-6">
            No PIN provided. Please enter your PIN to access this content.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Link href="/pin">
              <Button variant="outline">Enter PIN</Button>
            </Link>
            <Link href="/">
              <Button className="bg-green-600 hover:bg-green-700">Return to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Fetch content from API
  let subject: any = null
  let error: string | null = null

  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || "https://www.examnova.name.ng"}/api/content?subjectId=${subjectId}&pin=${pin}`, {
      cache: "no-store",
    })
    const data = await response.json()

    if (!response.ok) {
      error = data.error || "Failed to load content"
    } else {
      subject = data.subject
    }
  } catch (err) {
    error = "Failed to load content"
  }

  if (error || !subject) {
    return (
      <div className="container py-10">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center mb-4">
            <Lock className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">Access Denied</h1>
          <p className="text-center text-muted-foreground mb-6">
            {error || "Invalid or expired PIN. Please purchase this subject to access the content."}
          </p>
          <div className="flex flex-col items-center gap-4">
            <Link href="/pin">
              <Button variant="outline">Try Another PIN</Button>
            </Link>
            <Link href="/">
              <Button className="bg-green-600 hover:bg-green-700">Return to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/" className="flex items-center text-green-600 hover:text-green-700 mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>

      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{subject.title}</h1>
        <p className="text-lg text-muted-foreground">{subject.subcategory_name} - {subject.category_name}</p>
      </header>

      {subject.image_url && (
        <figure className="mb-8 rounded-lg overflow-hidden shadow-lg">
          <Image
            src={subject.image_url || "/placeholder.svg"}
            alt={subject.title}
            width={800}
            height={400}
            className="object-cover w-full h-auto"
            priority
            unoptimized
          />
        </figure>
      )}

      <div className="prose prose-lg max-w-none prose-img:rounded-lg prose-img:shadow-md prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline prose-h2:text-2xl prose-h3:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:mt-6 prose-h3:mb-3 prose-p:leading-relaxed prose-ul:my-4 prose-ol:my-4">
        <div dangerouslySetInnerHTML={{ __html: subject.content }} />
      </div>
    </article>
  )
}
