"use server"

import { sql } from "@/lib/db"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import * as bcrypt from "bcryptjs"

export async function loginAdmin(email: string, password: string) {
  try {
    console.log("Login attempt for:", email)

    // Check if the admin exists
    const [admin] = await sql`
      SELECT id, email, password_hash
      FROM admin_users
      WHERE email = ${email}
    `

    console.log("Admin found:", !!admin)

    if (!admin) {
      console.log("Admin not found with email:", email)
      return { success: false, error: "Invalid credentials" }
    }

    // Verify the password
    const passwordMatch = await bcrypt.compare(password, admin.password_hash)
    console.log("Password match:", passwordMatch)

    if (!passwordMatch) {
      console.log("Password does not match for admin:", email)
      return { success: false, error: "Invalid credentials" }
    }

    // Set a cookie to indicate the admin is logged in
    cookies().set("admin_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })

    console.log("Admin login successful for:", email)
    return { success: true }
  } catch (error) {
    console.error("Failed to login admin:", error)
    return { success: false, error: "Failed to login" }
  }
}

export async function logoutAdmin() {
  console.log("Admin logout requested")
  cookies().delete("admin_session")
  redirect("/admin-access")
}

export async function checkAdminSession() {
  const session = cookies().get("admin_session")
  const hasSession = session?.value === "true"
  console.log("Admin session check:", hasSession)
  return hasSession
}

export async function createAdminUser(email: string, password: string) {
  try {
    console.log("Creating admin user:", email)

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10)

    // Check if the admin already exists
    const [existingAdmin] = await sql`
      SELECT id FROM admin_users WHERE email = ${email}
    `

    if (existingAdmin) {
      console.log("Admin user already exists:", email)
      return { success: false, error: "Admin user already exists" }
    }

    // Create the admin user
    const [admin] = await sql`
      INSERT INTO admin_users (email, password_hash)
      VALUES (${email}, ${passwordHash})
      RETURNING id, email, created_at
    `

    console.log("Admin user created successfully:", email)
    return { success: true, admin }
  } catch (error) {
    console.error("Failed to create admin user:", error)
    return { success: false, error: "Failed to create admin user" }
  }
}
