"use server"

import { sql } from "@/lib/db"
import { headers } from "next/headers"
import { logger } from "@/lib/logger"

export async function trackPostView(postId: number) {
  try {
    const headersList = await headers()
    const userIp = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    logger.info(`[POST_VIEWS] Tracking view for post ${postId} from IP ${userIp}`)

    // Insert or update view record
    await sql`
      INSERT INTO post_views (post_id, user_ip, user_agent, viewed_at)
      VALUES (${postId}, ${userIp}, ${userAgent}, CURRENT_TIMESTAMP)
      ON CONFLICT (post_id, user_ip) 
      DO UPDATE SET viewed_at = CURRENT_TIMESTAMP
    `

    // Update view count
    await sql`
      UPDATE posts 
      SET views_count = (SELECT COUNT(*) FROM post_views WHERE post_id = ${postId})
      WHERE id = ${postId}
    `

    logger.info(`[POST_VIEWS] View tracked successfully for post ${postId}`)
    return { success: true }
  } catch (error) {
    logger.error(`[POST_VIEWS] Failed to track post view:`, error instanceof Error ? error.message : String(error))
    return { success: false, error: "Failed to track view" }
  }
}

export async function getPostViewCount(postId: number) {
  try {
    const [post] = await sql`
      SELECT views_count FROM posts WHERE id = ${postId}
    `
    return post?.views_count || 0
  } catch (error) {
    logger.error(`[POST_VIEWS] Failed to get post view count:`, error instanceof Error ? error.message : String(error))
    return 0
  }
}

export async function getAllPostsWithViews() {
  try {
    logger.info(`[POST_VIEWS] Fetching all posts with view counts`)

    const posts = await sql`
      SELECT 
        p.id,
        p.title,
        p.content,
        p.image_url,
        p.is_featured,
        p.created_at,
        p.updated_at,
        COALESCE(p.views_count, 0) as views_count,
        (SELECT COUNT(*) FROM post_views WHERE post_id = p.id) as total_views
      FROM posts p
      ORDER BY p.created_at DESC
    `

    logger.info(`[POST_VIEWS] Retrieved ${posts.length} posts`)
    return posts
  } catch (error) {
    logger.error(`[POST_VIEWS] Failed to fetch posts:`, error instanceof Error ? error.message : String(error))
    return []
  }
}
