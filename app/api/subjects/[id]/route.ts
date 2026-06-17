import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { checkAdminSession } from "@/app/actions/admin"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if the user is authenticated as admin
    const isAdmin = await checkAdminSession()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid subject ID" }, { status: 400 })
    }

    const [subject] = await sql`
      SELECT s.id, s.title, s.price, s.content, s.subcategory_id, s.is_featured, s.image_url, s.created_at,
             sc.name as subcategory_name, c.name as category_name
      FROM subjects s
      JOIN exam_subcategories sc ON s.subcategory_id = sc.id
      JOIN exam_categories c ON sc.category_id = c.id
      WHERE s.id = ${id}
    `

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }

    return NextResponse.json(subject)
  } catch (error) {
    console.error(`Failed to fetch subject with id ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch subject" }, { status: 500 })
  }
}
