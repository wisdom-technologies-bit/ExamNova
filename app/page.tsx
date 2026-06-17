import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getExamCategories } from "@/app/actions/exam-categories"
import { getFeaturedSubjects } from "@/app/actions/subjects"
import { getFeaturedPosts } from "@/app/actions/posts"
import { formatNaira } from "@/lib/utils"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-green-50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Access WAEC, NECO & NABTEB exam EXPO instantly.
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Get instant access to live and future exam content. Pay per subject and receive your PIN immediately.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="#exam-categories">
                  <Button className="bg-green-600 hover:bg-green-700">
                    Explore Subjects
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pin">
                  <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                    Enter PIN
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <Image
                src="https://i.ibb.co/Kp8mrkCF/file-000000004cf4620a943d468bf7df484d.png"
                alt="Exam Nova"
                width={400}
                height={400}
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Exam Categories Section */}
      <section id="exam-categories" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Exam Categories</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Choose from our comprehensive collection of exam categories.
              </p>
            </div>
          </div>
          <Suspense fallback={<ExamCategoriesSkeleton />}>
            <ExamCategories />
          </Suspense>
        </div>
      </section>

      {/* Featured Subjects Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-green-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Featured Subjects</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Explore our most popular exam subjects.
              </p>
            </div>
          </div>
          <Suspense fallback={<FeaturedSubjectsSkeleton />}>
            <FeaturedSubjects />
          </Suspense>
        </div>
      </section>

      {/* Featured Updates Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Featured Updates</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Stay updated with the latest news and resources.
              </p>
            </div>
          </div>
          <Suspense fallback={<FeaturedPostsSkeleton />}>
            <FeaturedPosts />
          </Suspense>
        </div>
      </section>
    </div>
  )
}

async function ExamCategories() {
  const categories = await getExamCategories()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {categories.map((category) => (
        <Link key={category.id} href={`/exams/${category.slug}`}>
          <Card className="h-full transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Access {category.name} exam expo and prepare effectively.</p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full text-green-600 hover:text-green-700 hover:bg-green-50">
                View Subjects
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}

async function FeaturedSubjects() {
  const subjects = await getFeaturedSubjects()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
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

async function FeaturedPosts() {
  const posts = await getFeaturedPosts()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {posts.map((post) => (
        <Card key={post.id} className="h-full transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>{post.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {post.image_url && (
              <div className="mb-4">
                <Image
                  src={post.image_url || "/placeholder.svg?height=100&width=200"}
                  alt={post.title}
                  width={200}
                  height={100}
                  className="rounded-md object-cover w-full h-32"
                />
              </div>
            )}
            <p className="text-muted-foreground line-clamp-3">{post.content.replace(/<[^>]*>?/gm, "")}</p>
          </CardContent>
          <CardFooter>
            <Link href={`/posts/${post.id}`} className="w-full">
              <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
                Read More
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function ExamCategoriesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="h-full">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function FeaturedSubjectsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
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

function FeaturedPostsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="h-full">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
