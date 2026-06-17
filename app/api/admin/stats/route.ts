import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { checkAdminSession } from "@/app/actions/admin"

export async function GET() {
  try {
    // Check if the user is authenticated as admin
    const isAdmin = await checkAdminSession()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get counts for dashboard
    const [categoriesCount] = await sql`SELECT COUNT(*) FROM exam_categories`
    const [subcategoriesCount] = await sql`SELECT COUNT(*) FROM exam_subcategories`
    const [subjectsCount] = await sql`SELECT COUNT(*) FROM subjects`
    const [postsCount] = await sql`SELECT COUNT(*) FROM posts`
    const [messagesCount] = await sql`SELECT COUNT(*) FROM contact_messages`
    const [paymentsCount] = await sql`SELECT COUNT(*) FROM payments`

    // Get total revenue
    const [revenue] = await sql`SELECT COALESCE(SUM(amount), 0) as total FROM payments`

    // Get recent payments
    const recentPayments = await sql`
      SELECT p.id, p.user_email, p.amount, p.created_at,
             s.title as subject_title
      FROM payments p
      JOIN subjects s ON p.subject_id = s.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `

    // Get recent messages
    const recentMessages = await sql`
      SELECT id, full_name, email, is_replied, created_at
      FROM contact_messages
      ORDER BY created_at DESC
      LIMIT 5
    `

    // Get popular subjects
    const popularSubjects = await sql`
      SELECT s.id, s.title, COUNT(p.id) as purchase_count
      FROM subjects s
      JOIN payments p ON s.id = p.subject_id
      GROUP BY s.id, s.title
      ORDER BY purchase_count DESC
      LIMIT 5
    `

    return NextResponse.json({
      counts: {
        categories: categoriesCount.count,
        subcategories: subcategoriesCount.count,
        subjects: subjectsCount.count,
        posts: postsCount.count,
        messages: messagesCount.count,
        payments: paymentsCount.count,
      },
      revenue: revenue.total,
      recentPayments,
      recentMessages,
      popularSubjects,
    })
  } catch (error) {
    console.error("Failed to fetch admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 })
  }
}
