import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getSubjectsBySubcategory } from "@/app/actions/subjects"
import { formatNaira } from "@/lib/utils"
import { notFound } from "next/navigation"
import { sql } from "@/lib/db"

// Render on-demand instead of at build time
export const revalidate = 0

export default async function SubcategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const subcategoryId = Number.parseInt(id)

  if (isNaN(subcategoryId)) {
    notFound()
  }

  // Get subcategory details
  const [subcategory] = await sql`
    SELECT sc.id, sc.name, sc.slug, c.id as category_id, c.name as category_name, c.slug as category_slug
    FROM exam_subcategories sc
    JOIN exam_categories c ON sc.category_id = c.id
    WHERE sc.id = ${subcategoryId}
  `

  if (!subcategory) {
    notFound()
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Link
          href={`/exams/${subcategory.category_slug}`}
          className="flex items-center text-green-600 hover:text-green-700 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {subcategory.category_name}
        </Link>
        <h1 className="text-3xl font-bold">{subcategory.name}</h1>
        <p className="text-muted-foreground mt-2">
          Browse {subcategory.name} subjects under {subcategory.category_name}
        </p>
      </div>

      <Suspense fallback={<SubjectsSkeleton />}>
        <Subjects subcategoryId={subcategoryId} />
      </Suspense>
    </div>
  )
}

async function Subjects({ subcategoryId }: { subcategoryId: number }) {
  const subjects = await getSubjectsBySubcategory(subcategoryId)

  if (subjects.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No subjects found in this subcategory</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subjects.map((subject) => (
        <Card key={subject.id} className="h-full transition-all hover:shadow-md">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>{subject.title}</CardTitle>
              {subject.is_featured && <Badge className="bg-green-600">Featured</Badge>}
            </div>
            <CardDescription>
              {subject.subcategory_name} - {subject.category_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subject.image_url && (
              <div className="mb-4">
                <Image
                  src={subject.image_url || "/placeholder.svg?height=100&width=200"}
                  alt={subject.title}
                  width={200}
                  height={100}
                  className="rounded-md object-cover w-full h-32"
                />
              </div>
            )}
            <p className="font-bold text-lg text-green-600">{formatNaira(Number(subject.price))}</p>
          </CardContent>
          <CardFooter>
            <Link href={`/subjects/${subject.id}`} className="w-full">
              <Button className="w-full bg-green-600 hover:bg-green-700">Access with PIN</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function SubjectsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="h-full">
          <CardHeader>
            <div className="flex justify-between items-start">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full mb-4" />
            <Skeleton className="h-6 w-24" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
