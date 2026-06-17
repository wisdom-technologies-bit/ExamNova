import { neon } from "@neondatabase/serverless"

// Replace the current SQL client creation with this improved version that includes error handling
// and better environment variable access

// Create a reusable SQL client with proper error handling
export const sql = (() => {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    console.error("[DB] DATABASE_URL environment variable is not set")
    // Return a function that throws a more helpful error when used
    return () => {
      throw new Error("Database connection failed: No DATABASE_URL environment variable provided")
    }
  }

  try {
    console.log("[DB] Initializing Neon database connection")
    const sqlInstance = neon(connectionString)
    console.log("[DB] Database connection initialized successfully")
    return sqlInstance
  } catch (error) {
    console.error("[DB] Failed to initialize database connection:", error)
    // Return a function that throws an error when used
    return () => {
      throw new Error("Database connection failed: " + (error instanceof Error ? error.message : String(error)))
    }
  }
})()

// Helper function to format dates
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Helper function to generate a unique PIN
export function generatePIN(length = 8): string {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let pin = ""

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    pin += characters.charAt(randomIndex)
  }

  return pin
}

// Helper function to calculate expiration date (24 hours from now)
export function getExpirationDate(): Date {
  const date = new Date()
  date.setHours(date.getHours() + 24)
  return date
}
