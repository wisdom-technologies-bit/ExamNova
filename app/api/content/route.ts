import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const subjectId = searchParams.get("subjectId")
  const pin = searchParams.get("pin")

  if (!subjectId || !pin) {
    return NextResponse.json({ error: "Subject ID and PIN are required" }, { status: 400 })
  }

  try {
    // Verify the PIN is valid for this subject
    const [pinRecord] = await sql`
      SELECT p.id, p.pin_code, p.subject_id, p.user_email, p.is_used, p.expires_at
      FROM pins p
      WHERE p.pin_code = ${pin}
        AND p.subject_id = ${Number.parseInt(subjectId)}
        AND p.expires_at > CURRENT_TIMESTAMP
    `

    if (!pinRecord) {
      return NextResponse.json({ error: "Invalid or expired PIN" }, { status: 403 })
    }

    // Get the subject content
    const [subject] = await sql`
      SELECT s.id, s.title, s.content, s.image_url,
             sc.name as subcategory_name, c.name as category_name
      FROM subjects s
      JOIN exam_subcategories sc ON s.subcategory_id = sc.id
      JOIN exam_categories c ON sc.category_id = c.id
      WHERE s.id = ${Number.parseInt(subjectId)}
    `

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }

    return NextResponse.json({ subject })
  } catch (error) {
    console.error("Error fetching subject content:", error)
    return NextResponse.json({ error: "Failed to fetch subject content" }, { status: 500 })
  }
}
