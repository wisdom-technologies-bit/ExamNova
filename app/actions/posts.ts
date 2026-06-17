"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { logger } from "@/lib/logger"

export async function getFeaturedPosts(limit = 3) {
  try {
    const posts = await sql`
      SELECT id, title, content, image_url, is_featured, created_at, updated_at
      FROM posts
      WHERE is_featured = true
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return posts
  } catch (error) {
    console.error("Failed to fetch featured posts:", error)
    return []
  }
}

export async function getAllPosts() {
  try {
    const posts = await sql`
      SELECT id, title, content, image_url, is_featured, created_at, updated_at
      FROM posts
      ORDER BY created_at DESC
    `
    return posts
  } catch (error) {
    console.error("Failed to fetch all posts:", error)
    return []
  }
}

export async function getPostById(id: number) {
  try {
    logger.info(`Fetching post with ID: ${id}`)

    const [post] = await sql`
      SELECT id, title, content, image_url, is_featured, created_at, updated_at
      FROM posts
      WHERE id = ${id}
    `

    if (post) {
      logger.info(`Post found: ${post.title}, image URL: ${post.image_url || "none"}`)
    } else {
      logger.error(`Post with ID ${id} not found`)
    }

    return post
  } catch (error) {
    logger.error(`Failed to fetch post with id ${id}:`, error)
    return null
  }
}

export async function createPost(title: string, content: string, isFeatured: boolean, imageUrl?: string) {
  try {
    const [post] = await sql`
      INSERT INTO posts (title, content, is_featured, image_url)
      VALUES (${title}, ${content}, ${isFeatured}, ${imageUrl})
      RETURNING id, title, content, is_featured, image_url, created_at
    `

    revalidatePath("/admin/posts")
    revalidatePath("/")

    return { success: true, post }
  } catch (error) {
    console.error("Failed to create post:", error)
    return { success: false, error: "Failed to create post" }
  }
}

export async function updatePost(id: number, title: string, content: string, isFeatured: boolean, imageUrl?: string) {
  try {
    const [post] = await sql`
      UPDATE posts
      SET title = ${title},
          content = ${content},
          is_featured = ${isFeatured},
          image_url = ${imageUrl},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, title, content, is_featured, image_url, created_at, updated_at
    `

    revalidatePath("/admin/posts")
    revalidatePath(`/posts/${id}`)
    revalidatePath("/")

    return { success: true, post }
  } catch (error) {
    console.error(`Failed to update post with id ${id}:`, error)
    return { success: false, error: "Failed to update post" }
  }
}

export async function deletePost(id: number) {
  try {
    await sql`
      DELETE FROM posts
      WHERE id = ${id}
    `

    revalidatePath("/admin/posts")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error(`Failed to delete post with id ${id}:`, error)
    return { success: false, error: "Failed to delete post" }
  }
}
