import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { Metadata } from "next"
import { ArrowLeft, Eye } from "lucide-react"

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
    <article className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/posts" className="flex items-center text-green-600 hover:text-green-700 mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Posts
      </Link>

      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <time dateTime={post.created_at}>Published on {formatDate(post.created_at)}</time>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{viewCount} {viewCount === 1 ? "view" : "views"}</span>
          </div>
        </div>
      </header>

      {post.image_url && (
        <figure className="mb-8">
          <Image
            src={post.image_url}
            alt={post.title}
            width={800}
            height={400}
            className="rounded-lg object-cover w-full h-auto shadow-lg"
            priority
            unoptimized
          />
        </figure>
      )}

      <div className="prose prose-lg max-w-none prose-img:rounded-lg prose-img:shadow-md prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline prose-h2:text-2xl prose-h3:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:mt-6 prose-h3:mb-3 prose-p:leading-relaxed prose-ul:my-4 prose-ol:my-4">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>

      <footer className="mt-12 pt-8 border-t">
        <Link href="/posts" className="inline-flex items-center text-green-600 hover:text-green-700 font-medium">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Posts
        </Link>
      </footer>
    </article>
  )
}

function PostDetailSkeleton() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Skeleton className="h-4 w-4 mr-2" />
        <Skeleton className="h-4 w-40" />
      </div>

      <header className="mb-8">
        <Skeleton className="h-10 w-3/4 mb-4" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
        </div>
      </header>

      <Skeleton className="h-80 w-full mb-8 rounded-lg" />

      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full mt-8" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </article>
  )
}
