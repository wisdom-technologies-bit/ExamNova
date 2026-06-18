import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { Metadata } from "next"
import { ArrowLeft, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getPostById } from "@/app/actions/posts"
import { trackPostView, getPostViewCount } from "@/app/actions/post-views"
import { formatDate } from "@/lib/db"
import { notFound } from "next/navigation"
import { logger } from "@/lib/logger"

// Render on-demand instead of at build time
export const revalidate = 0

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const postId = Number.parseInt(id)

  if (isNaN(postId)) {
    return {
      title: "Post Not Found | ExamNova",
    }
  }

  try {
    const post = await getPostById(postId)

    if (!post) {
      return {
        title: "Post Not Found | ExamNova",
      }
    }

    const description = post.content?.replace(/<[^>]*>/g, "").substring(0, 160) || "Read our latest blog posts on ExamNova"

    return {
      title: `${post.title} | ExamNova`,
      description: description,
      openGraph: {
        title: post.title,
        description: description,
        type: "article",
        url: `https://www.examnova.name.ng/posts/${postId}`,
        images: post.image_url
          ? [
              {
                url: post.image_url,
                width: 1200,
                height: 630,
                alt: post.title,
              },
            ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: description,
        images: post.image_url ? [post.image_url] : [],
      },
    }
  } catch (error) {
    return {
      title: "Post | ExamNova",
    }
  }
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const postId = Number.parseInt(id)

  if (isNaN(postId)) {
    notFound()
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10">
      <Suspense fallback={<PostDetailSkeleton />}>
          <PostDetail postId={postId} />
            </Suspense>
            </div>
  )
}

async function PostDetail({ postId }: { postId: number }) {
  logger.info(`Fetching post with ID: ${postId}`)
  const post = await getPostById(postId)

  if (!post) {
    logger.error(`Post with ID ${postId} not found`)
    notFound()
  }

  logger.info(`Post found: ${post.title}, has image: ${!!post.image_url}`)

  // Track the view
  await trackPostView(postId)

  // Get current view count
  const viewCount = await getPostViewCount(postId)

  return (
    <div>
      <Link href="/" className="flex items-center text-green-600 hover:text-green-700 mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{post.title}</CardTitle>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>Published on {formatDate(post.created_at)}</span>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{viewCount} views</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {post.image_url && (
            <div className="mb-6">
              <Image
                src={post.image_url || "/placeholder.svg"}
                alt={post.title}
                width={800}
                height={400}
                className="rounded-md object-cover w-full h-64"
                priority
                unoptimized
              />
            </div>
          )}

          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PostDetailSkeleton() {
  return (
    <div>
      <div className="flex items-center mb-4">
        <Skeleton className="h-4 w-4 mr-2" />
        <Skeleton className="h-4 w-40" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/3 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full mb-6" />

          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
