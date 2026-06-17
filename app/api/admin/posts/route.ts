import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { checkAdminSession } from "@/app/actions/admin"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    // Check if the user is authenticated as admin
    const isAdmin = await checkAdminSession()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    logger.info("Fetching all posts for admin dashboard")

    const posts = await sql`
      SELECT id, title, content, image_url, is_featured, created_at, updated_at
      FROM posts
      ORDER BY created_at DESC
    `

    logger.info(`Successfully fetched ${posts.length} posts`)
    return NextResponse.json(posts)
  } catch (error) {
    logger.error("Failed to fetch posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}
