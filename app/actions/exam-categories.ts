"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getExamCategories() {
  try {
    const categories = await sql`
      SELECT id, name, slug, created_at
      FROM exam_categories
      ORDER BY name ASC
    `
    return categories
  } catch (error) {
    console.error("Failed to fetch exam categories:", error)
    return []
  }
}

export async function getExamCategoryBySlug(slug: string) {
  try {
    const [category] = await sql`
      SELECT id, name, slug, created_at
      FROM exam_categories
      WHERE slug = ${slug}
    `
    return category
  } catch (error) {
    console.error(`Failed to fetch exam category with slug ${slug}:`, error)
    return null
  }
}

export async function getSubcategoriesByCategory(categoryId: number) {
  try {
    const subcategories = await sql`
      SELECT id, name, slug, category_id, created_at
      FROM exam_subcategories
      WHERE category_id = ${categoryId}
      ORDER BY name ASC
    `
    return subcategories
  } catch (error) {
    console.error(`Failed to fetch subcategories for category ${categoryId}:`, error)
    return []
  }
}

export async function createExamCategory(name: string) {
  try {
    const slug = name.toLowerCase().replace(/\s+/g, "-")

    const [category] = await sql`
      INSERT INTO exam_categories (name, slug)
      VALUES (${name}, ${slug})
      RETURNING id, name, slug, created_at
    `

    revalidatePath("/admin/categories")
    revalidatePath("/")

    return { success: true, category }
  } catch (error) {
    console.error("Failed to create exam category:", error)
    return { success: false, error: "Failed to create exam category" }
  }
}

export async function createExamSubcategory(name: string, categoryId: number) {
  try {
    console.log(`Creating subcategory "${name}" for category ID ${categoryId}`)

    if (!name || !name.trim()) {
      console.error("Subcategory name is empty")
      return { success: false, error: "Subcategory name is required" }
    }

    if (!categoryId || isNaN(categoryId)) {
      console.error("Invalid category ID:", categoryId)
      return { success: false, error: "Invalid category ID" }
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-")

    // First check if the category exists
    const [category] = await sql`
      SELECT id FROM exam_categories WHERE id = ${categoryId}
    `

    if (!category) {
      console.error(`Category with ID ${categoryId} not found`)
      return { success: false, error: "Category not found" }
    }

    // Then create the subcategory
    const [subcategory] = await sql`
      INSERT INTO exam_subcategories (name, slug, category_id)
      VALUES (${name}, ${slug}, ${categoryId})
      RETURNING id, name, slug, category_id, created_at
    `

    console.log("Subcategory created successfully:", subcategory)

    revalidatePath("/admin/categories")
    revalidatePath(`/exams/${slug}`)

    return { success: true, subcategory }
  } catch (error) {
    console.error("Failed to create exam subcategory:", error)
    return { success: false, error: "Failed to create exam subcategory" }
  }
}

export async function deleteExamCategory(id: number) {
  try {
    await sql`
      DELETE FROM exam_categories
      WHERE id = ${id}
    `

    revalidatePath("/admin/categories")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error(`Failed to delete exam category with id ${id}:`, error)
    return { success: false, error: "Failed to delete exam category" }
  }
}

export async function deleteExamSubcategory(id: number) {
  try {
    await sql`
      DELETE FROM exam_subcategories
      WHERE id = ${id}
    `

    revalidatePath("/admin/categories")

    return { success: true }
  } catch (error) {
    console.error(`Failed to delete exam subcategory with id ${id}:`, error)
    return { success: false, error: "Failed to delete exam subcategory" }
  }
}
