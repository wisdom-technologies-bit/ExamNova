import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getExamCategoryBySlug, getSubcategoriesByCategory } from "@/app/actions/exam-categories"
import { getSubjectsBySubcategory } from "@/app/actions/subjects"
import { formatNaira } from "@/lib/utils"
import { notFound } from "next/navigation"

export default async function ExamCategoryPage({ params }: { params: { slug: string } }) {
  const category = await getExamCategoryBySlug(params.slug)

  if (!category) {
    notFound()
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Link href="/" className="flex items-center text-green-600 hover:text-green-700 mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold">{category.name} Exams</h1>
        <p className="text-muted-foreground mt-2">Browse {category.name} exam subjects and subcategories</p>
      </div>

      <Suspense fallback={<SubcategoriesWithSubjectsSkeleton />}>
        <SubcategoriesWithSubjects categoryId={category.id} />
      </Suspense>
    </div>
  )
}

async function SubcategoriesWithSubjects({ categoryId }: { categoryId: number }) {
  const subcategories = await getSubcategoriesByCategory(categoryId)

  if (subcategories.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No subcategories found</p>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {subcategories.map((subcategory) => (
        <div key={subcategory.id} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{subcategory.name}</h2>
            <Link href={`/subcategory/${subcategory.id}`}>
              <Button variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                View All
              </Button>
            </Link>
          </div>

          <Suspense fallback={<SubjectsSkeleton />}>
            <SubjectsBySubcategory subcategoryId={subcategory.id} />
          </Suspense>
        </div>
      ))}
    </div>
  )
}

async function SubjectsBySubcategory({ subcategoryId }: { subcategoryId: number }) {
  const subjects = await getSubjectsBySubcategory(subcategoryId)

  if (subjects.length === 0) {
    return (
      <div className="text-center py-6">
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
            <CardDescription>{subject.subcategory_name}</CardDescription>
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

function SubcategoriesWithSubjectsSkeleton() {
  return (
    <div className="space-y-12">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-24" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((j) => (
              <Card key={j} className="h-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-5 w-20" />
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
        </div>
      ))}
    </div>
  )
}

function SubjectsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="h-full">
          <CardHeader>
            <div className="flex justify-between items-start">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-5 w-20" />
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
