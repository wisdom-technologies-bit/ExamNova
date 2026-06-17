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

    logger.info("Fetching all subjects for admin dashboard")

    const subjects = await sql`
      SELECT s.id, s.title, s.price, s.is_featured, s.image_url, s.created_at,
             sc.name as subcategory_name, c.name as category_name
      FROM subjects s
      JOIN exam_subcategories sc ON s.subcategory_id = sc.id
      JOIN exam_categories c ON sc.category_id = c.id
      ORDER BY s.created_at DESC
    `

    logger.info(`Successfully fetched ${subjects.length} subjects`)
    return NextResponse.json(subjects)
  } catch (error) {
    logger.error("Failed to fetch subjects:", error)
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 })
  }
}
