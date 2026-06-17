import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getSubjectById } from "@/app/actions/subjects"
import { formatNaira } from "@/lib/utils"
import { notFound } from "next/navigation"
import { logger } from "@/lib/logger"

// Render on-demand instead of at build time
export const revalidate = 0

export default async function SubjectPage({ params }: { params: { id: string } }) {
  const subjectId = Number.parseInt(params.id)

  if (isNaN(subjectId)) {
    notFound()
  }

  return (
    <div className="container py-10">
      <Suspense fallback={<SubjectDetailSkeleton />}>
        <SubjectDetail subjectId={subjectId} />
      </Suspense>
    </div>
  )
}

async function SubjectDetail({ subjectId }: { subjectId: number }) {
  logger.info(`Fetching subject with ID: ${subjectId}`)
  const subject = await getSubjectById(subjectId)

  if (!subject) {
    logger.error(`Subject with ID ${subjectId} not found`)
    notFound()
  }

  logger.info(`Subject found: ${subject.title}, has image: ${!!subject.image_url}`)

  return (
    <div>
      <Link
        href={`/exams/${subject.category_slug}`}
        className="flex items-center text-green-600 hover:text-green-700 mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to {subject.category_name}
      </Link>

      <Card className="mb-8">
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
                width={600}
                height={300}
                className="rounded-md object-cover w-full h-64"
                priority
                unoptimized
              />
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Subject Details</h3>
            <p className="text-muted-foreground">
              This is a preview of the subject content. To access the full content, you need to purchase this subject
              and enter the PIN.
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-md">
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-2xl font-bold text-green-600">{formatNaira(Number(subject.price))}</p>
            </div>
            <Link href={`/payment/${subject.id}`}>
              <Button className="bg-green-600 hover:bg-green-700">Purchase Now</Button>
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <p className="text-sm text-muted-foreground mb-2">Already have a PIN? Enter it to access this subject.</p>
          <Link href="/pin" className="w-full sm:w-auto">
            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
              Enter PIN
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

function SubjectDetailSkeleton() {
  return (
    <div>
      <div className="flex items-center mb-4">
        <Skeleton className="h-4 w-4 mr-2" />
        <Skeleton className="h-4 w-40" />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full mb-6" />

          <div className="mb-6">
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-100 rounded-md">
            <div>
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-8 w-32" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    </div>
  )
}
