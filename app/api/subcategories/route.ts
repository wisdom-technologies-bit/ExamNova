import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const subcategories = await sql`
      SELECT sc.id, sc.name, sc.slug, sc.category_id, c.name as category_name
      FROM exam_subcategories sc
      JOIN exam_categories c ON sc.category_id = c.id
      ORDER BY c.name, sc.name
    `

    return NextResponse.json(subcategories)
  } catch (error) {
    console.error("Failed to fetch subcategories:", error)
    return NextResponse.json({ error: "Failed to fetch subcategories" }, { status: 500 })
  }
}
