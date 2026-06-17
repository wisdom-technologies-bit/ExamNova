"use server"

import { sql } from "@/lib/db"
import * as bcrypt from "bcryptjs"
import { logger } from "@/lib/logger"

export async function fixAdminPassword() {
  try {
    logger.info("Starting admin password fix process")

    // Check if temp_password column exists and has data
    const [adminUser] = await sql`
      SELECT id, email, temp_password 
      FROM admin_users 
      WHERE email = 'wisdommeremeze@gmail.com'
    `

    if (!adminUser || !adminUser.temp_password) {
      logger.error("Admin user not found or temp_password is empty")
      return {
        success: false,
        message: "Admin user not found or temporary password is not set",
      }
    }

    logger.info(`Found admin user: ${adminUser.email} with temporary password`)

    // Hash the plaintext password
    const passwordHash = await bcrypt.hash(adminUser.temp_password, 10)
    logger.info("Generated new password hash")

    // Update the password_hash column
    await sql`
      UPDATE admin_users
      SET password_hash = ${passwordHash}
      WHERE id = ${adminUser.id}
    `
    logger.info("Updated password_hash with new hash")

    // Drop the temporary column
    await sql`
      ALTER TABLE admin_users DROP COLUMN IF EXISTS temp_password
    `
    logger.info("Removed temporary password column")

    return {
      success: true,
      message: "Password has been successfully updated. You can now log in with the password: admin123",
    }
  } catch (error) {
    logger.error("Error fixing admin password:", error)
    return {
      success: false,
      message: "Failed to update password: " + (error instanceof Error ? error.message : String(error)),
    }
  }
}
