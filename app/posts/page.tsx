import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye, Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getAllPostsWithViews } from "@/app/actions/post-views"
import { formatDate } from "@/lib/db"
import { Badge } from "@/components/ui/badge"

// Render on-demand instead of at build time
export const revalidate = 0

export const metadata = {
  title: "All Posts - ExamNova",
  description: "Read all the latest posts and updates from ExamNova",
}

export default function PostsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<PostsLoadingSkeleton />}>
          <PostsList />
        </Suspense>
      </div>
    </div>
  )
}

async function PostsList() {
  const posts = await getAllPostsWithViews()

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">All Posts</h1>
        <p className="text-lg text-slate-600 mb-8">No posts available at the moment.</p>
        <Link href="/">
          <Button className="bg-green-600 hover:bg-green-700">Return to Home</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3 tracking-tight">
          ExamNova Blog & Updates
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl">
          Stay informed with the latest exam tips, study guides, and important updates from our platform.
        </p>
      </div>

      {/* Featured Post */}
      {posts[0]?.is_featured && (
        <div className="mb-12">
          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="grid md:grid-cols-2 gap-0">
              {posts[0]?.image_url && (
                <div className="relative h-64 md:h-full min-h-80">
                  <Image
                    src={posts[0].image_url || "/placeholder.svg?height=400&width=600"}
                    alt={posts[0]?.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-green-600 hover:bg-green-700">Featured</Badge>
                  </div>
                </div>
              )}
              <div className="p-8 flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-slate-900 mb-3 line-clamp-2">{posts[0]?.title}</h2>
                <p className="text-slate-600 mb-4 line-clamp-3">
                  {posts[0]?.content.substring(0, 150)}...
                </p>
                <div className="flex items-center gap-6 mb-6 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(posts[0]?.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{posts[0]?.views_count || 0} views</span>
                  </div>
                </div>
                <Link href={`/posts/${posts[0]?.id}`}>
                  <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Posts Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.slice(posts[0]?.is_featured ? 1 : 0).map((post) => (
          <Link key={post.id} href={`/posts/${post.id}`}>
            <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer">
              {post.image_url && (
                <div className="relative h-48 bg-slate-200">
                  <Image
                    src={post.image_url || "/placeholder.svg?height=200&width=300"}
                    alt={post.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardHeader className="pb-3">
                <CardTitle className="line-clamp-2 text-lg">{post.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {post.content.substring(0, 80)}...
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(post.created_at)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {post.views_count || 0}
                  </div>
                </div>
                <Button variant="outline" className="w-full group">
                  Read Article
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Back to Home */}
      <div className="mt-12 text-center">
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}

function PostsLoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="mb-12">
        <Skeleton className="h-12 w-96 mb-4" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-2/3 mt-2" />
      </div>

      {/* Featured Post Skeleton */}
      <div className="grid md:grid-cols-2 gap-0 rounded-lg overflow-hidden">
        <Skeleton className="h-80 w-full" />
        <div className="p-8 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
