import type React from "react"
import { redirect } from "next/navigation"
import { checkAdminSession } from "@/app/actions/admin"
import AdminSidebar from "@/app/admin/components/admin-sidebar"
import { ensureAdminExists } from "../actions/setup"
import { logger } from "@/lib/logger"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Ensure admin user exists
  await ensureAdminExists()

  // Check if user is authenticated
  const isAuthenticated = await checkAdminSession()
  logger.info(`Admin authentication check: ${isAuthenticated ? "Authenticated" : "Not authenticated"}`)

  if (!isAuthenticated) {
    logger.info("Redirecting unauthenticated user to login page")
    redirect("/admin-access")
  }

  return (
    <div className="grid min-h-screen w-full overflow-hidden md:grid-cols-[240px_1fr]">
      <AdminSidebar />
      <main className="flex flex-col overflow-auto">
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </main>
    </div>
  )
}
