"use server"

import { sql } from "@/lib/db"
import { createAdminUser } from "./admin"
import { logger } from "@/lib/logger"

export async function ensureAdminExists() {
  try {
    logger.info("Checking if admin user exists")

    // Check if any admin user exists
    const [adminCount] = await sql`SELECT COUNT(*) FROM admin_users`

    if (Number(adminCount.count) === 0) {
      logger.info("No admin users found, creating default admin")

      // Create default admin user
      const result = await createAdminUser("admin@examnova.com", "admin123")

      if (result.success) {
        logger.info("Default admin user created successfully")
        return { success: true, message: "Default admin user created" }
      } else {
        logger.error("Failed to create default admin user", result.error)
        return { success: false, error: result.error }
      }
    }

    logger.info("Admin user already exists")
    return { success: true, message: "Admin user already exists" }
  } catch (error) {
    logger.error("Error ensuring admin exists", error)
    return { success: false, error: "Failed to check admin user" }
  }
}
