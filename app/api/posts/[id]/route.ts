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
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
    }

    const [post] = await sql`
      SELECT id, title, content, image_url, is_featured, created_at, updated_at
      FROM posts
      WHERE id = ${id}
    `

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error(`Failed to fetch post with id ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 })
  }
}
