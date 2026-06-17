// Environment variables with validation and fallbacks
export const env = {
  // Brevo API key for sending emails
  BREVO_API_KEY: process.env.BREVO_API_KEY || "",

  // Squad payment integration
  examnova_squad: process.env.examnova_squad || "",

  // Cloudinary configuration
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",

  // Application URL
  APP_URL: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000",
}

// Log environment variables status (without revealing sensitive values)
console.log("[ENV] Environment variables status:")
console.log(`[ENV] BREVO_API_KEY: ${env.BREVO_API_KEY ? "Set" : "Not set"}`)
console.log(`[ENV] examnova_squad: ${env.examnova_squad ? "Set" : "Not set"}`)
console.log(`[ENV] CLOUDINARY_CLOUD_NAME: ${env.CLOUDINARY_CLOUD_NAME ? "Set" : "Not set"}`)
console.log(`[ENV] CLOUDINARY_API_KEY: ${env.CLOUDINARY_API_KEY ? "Set" : "Not set"}`)
console.log(`[ENV] CLOUDINARY_API_SECRET: ${env.CLOUDINARY_API_SECRET ? "Set" : "Not set"}`)
console.log(`[ENV] APP_URL: ${env.APP_URL}`)
