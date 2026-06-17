"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { generatePIN, getExpirationDate } from "@/lib/db"
import { logger } from "@/lib/logger"

export async function getFeaturedSubjects(limit = 6) {
  try {
    const subjects = await sql`
      SELECT s.id, s.title, s.price, s.is_featured, s.image_url, s.created_at,
             sc.name as subcategory_name, c.name as category_name
      FROM subjects s
      JOIN exam_subcategories sc ON s.subcategory_id = sc.id
      JOIN exam_categories c ON sc.category_id = c.id
      WHERE s.is_featured = true
      ORDER BY s.created_at DESC
      LIMIT ${limit}
    `
    return subjects
  } catch (error) {
    console.error("Failed to fetch featured subjects:", error)
    return []
  }
}

export async function getSubjectsBySubcategory(subcategoryId: number) {
  try {
    const subjects = await sql`
      SELECT s.id, s.title, s.price, s.is_featured, s.image_url, s.created_at,
             sc.name as subcategory_name, c.name as category_name
      FROM subjects s
      JOIN exam_subcategories sc ON s.subcategory_id = sc.id
      JOIN exam_categories c ON sc.category_id = c.id
      WHERE s.subcategory_id = ${subcategoryId}
      ORDER BY s.created_at DESC
    `
    return subjects
  } catch (error) {
    console.error(`Failed to fetch subjects for subcategory ${subcategoryId}:`, error)
    return []
  }
}

export async function getSubjectsByCategory(categoryId: number, limit = 15) {
  try {
    const subjects = await sql`
      SELECT s.id, s.title, s.price, s.is_featured, s.image_url, s.created_at,
             sc.name as subcategory_name, c.name as category_name
      FROM subjects s
      JOIN exam_subcategories sc ON s.subcategory_id = sc.id
      JOIN exam_categories c ON sc.category_id = c.id
      WHERE c.id = ${categoryId}
      ORDER BY s.created_at DESC
      LIMIT ${limit}
    `
    return subjects
  } catch (error) {
    console.error(`Failed to fetch subjects for category ${categoryId}:`, error)
    return []
  }
}

export async function getSubjectById(id: number) {
  try {
    logger.info(`[SUBJECT] Fetching subject with ID: ${id}`)
    
    const [subject] = await sql`
      SELECT s.id, s.title, s.price, s.content, s.is_featured, s.image_url, s.created_at,
             sc.name as subcategory_name, c.name as category_name, c.slug as category_slug
      FROM subjects s
      JOIN exam_subcategories sc ON s.subcategory_id = sc.id
      JOIN exam_categories c ON sc.category_id = c.id
      WHERE s.id = ${id}
    `
    
    if (subject) {
      logger.info(`[SUBJECT] Subject found: ${subject.title}`)
    } else {
      logger.error(`[SUBJECT] Subject with ID ${id} not found in database`)
    }
    
    return subject
  } catch (error) {
    logger.error(`[SUBJECT] Failed to fetch subject with id ${id}:`, error instanceof Error ? error.message : String(error))
    return null
  }
}

export async function createSubject(
  title: string,
  price: number,
  content: string,
  subcategoryId: number,
  isFeatured: boolean,
  imageUrl?: string,
) {
  try {
    const [subject] = await sql`
      INSERT INTO subjects (title, price, content, subcategory_id, is_featured, image_url)
      VALUES (${title}, ${price}, ${content}, ${subcategoryId}, ${isFeatured}, ${imageUrl})
      RETURNING id, title, price, content, subcategory_id, is_featured, image_url, created_at
    `

    revalidatePath("/admin/subjects")
    revalidatePath("/")

    return { success: true, subject }
  } catch (error) {
    console.error("Failed to create subject:", error)
    return { success: false, error: "Failed to create subject" }
  }
}

export async function updateSubject(
  id: number,
  title: string,
  price: number,
  content: string,
  subcategoryId: number,
  isFeatured: boolean,
  imageUrl?: string,
) {
  try {
    const [subject] = await sql`
      UPDATE subjects
      SET title = ${title},
          price = ${price},
          content = ${content},
          subcategory_id = ${subcategoryId},
          is_featured = ${isFeatured},
          image_url = ${imageUrl},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, title, price, content, subcategory_id, is_featured, image_url, created_at, updated_at
    `

    revalidatePath("/admin/subjects")
    revalidatePath(`/subjects/${id}`)
    revalidatePath("/")

    return { success: true, subject }
  } catch (error) {
    console.error(`Failed to update subject with id ${id}:`, error)
    return { success: false, error: "Failed to update subject" }
  }
}

export async function deleteSubject(id: number) {
  try {
    await sql`
      DELETE FROM subjects
      WHERE id = ${id}
    `

    revalidatePath("/admin/subjects")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error(`Failed to delete subject with id ${id}:`, error)
    return { success: false, error: "Failed to delete subject" }
  }
}

export async function createPinForSubject(subjectId: number, userEmail: string) {
  try {
    const pin = generatePIN()
    const expiresAt = getExpirationDate()

    const [pinRecord] = await sql`
      INSERT INTO pins (pin_code, subject_id, user_email, expires_at)
      VALUES (${pin}, ${subjectId}, ${userEmail}, ${expiresAt})
      RETURNING id, pin_code, subject_id, user_email, expires_at, created_at
    `

    return { success: true, pin: pinRecord }
  } catch (error) {
    console.error("Failed to create PIN:", error)
    return { success: false, error: "Failed to create PIN" }
  }
}

export async function validatePin(pinCode: string) {
  try {
    const [pin] = await sql`
      SELECT p.id, p.pin_code, p.subject_id, p.user_email, p.is_used, p.expires_at,
             s.title as subject_title, s.content as subject_content, s.image_url
      FROM pins p
      JOIN subjects s ON p.subject_id = s.id
      WHERE p.pin_code = ${pinCode}
        AND p.expires_at > CURRENT_TIMESTAMP
    `

    if (!pin) {
      return { success: false, error: "Invalid or expired PIN" }
    }

    return { success: true, pin }
  } catch (error) {
    console.error(`Failed to validate PIN ${pinCode}:`, error)
    return { success: false, error: "Failed to validate PIN" }
  }
}
