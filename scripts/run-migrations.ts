import { sql } from "@/lib/db"

async function runMigrations() {
  try {
    console.log("[MIGRATION] Starting database migrations...")

    // Create post_views table
    console.log("[MIGRATION] Creating post_views table...")
    await sql`
      CREATE TABLE IF NOT EXISTS post_views (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_ip VARCHAR(45),
        user_agent TEXT,
        viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, user_ip)
      )
    `
    console.log("[MIGRATION] post_views table created successfully")

    // Create indexes for post_views
    console.log("[MIGRATION] Creating indexes for post_views...")
    await sql`
      CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON post_views(post_id)
    `
    await sql`
      CREATE INDEX IF NOT EXISTS idx_post_views_viewed_at ON post_views(viewed_at)
    `
    console.log("[MIGRATION] Indexes created successfully")

    // Add views_count column to posts table
    console.log("[MIGRATION] Adding views_count column to posts table...")
    await sql`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0
    `
    console.log("[MIGRATION] views_count column added successfully")

    // Create contact_message_replies table
    console.log("[MIGRATION] Creating contact_message_replies table...")
    await sql`
      CREATE TABLE IF NOT EXISTS contact_message_replies (
        id SERIAL PRIMARY KEY,
        contact_message_id INTEGER NOT NULL REFERENCES contact_messages(id) ON DELETE CASCADE,
        sender_type VARCHAR(20) NOT NULL DEFAULT 'user',
        sender_email VARCHAR(255) NOT NULL,
        sender_name VARCHAR(255),
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("[MIGRATION] contact_message_replies table created successfully")

    // Create indexes for contact_message_replies
    console.log("[MIGRATION] Creating indexes for contact_message_replies...")
    await sql`
      CREATE INDEX IF NOT EXISTS idx_contact_replies_message_id ON contact_message_replies(contact_message_id)
    `
    await sql`
      CREATE INDEX IF NOT EXISTS idx_contact_replies_created_at ON contact_message_replies(created_at)
    `
    console.log("[MIGRATION] Indexes created successfully")

    console.log("[MIGRATION] All migrations completed successfully!")
    process.exit(0)
  } catch (error) {
    console.error("[MIGRATION] Error running migrations:", error)
    process.exit(1)
  }
}

runMigrations()
