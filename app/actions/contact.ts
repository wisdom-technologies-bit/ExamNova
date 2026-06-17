"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { sendEmail, generateContactReplyEmail } from "@/lib/email"

export async function submitContactForm(fullName: string, email: string, message: string) {
  try {
    const [contactMessage] = await sql`
      INSERT INTO contact_messages (full_name, email, message)
      VALUES (${fullName}, ${email}, ${message})
      RETURNING id, full_name, email, message, created_at
    `

    // Send notification email to admin
    await sendEmail({
      to: "wisdommeremeze@gmail.com", // Admin email
      subject: "New Contact Form Submission",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
          <p><a href="${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/admin/contact">View in Admin Dashboard</a></p>
        </div>
      `,
    })

    revalidatePath("/contact")

    return { success: true, contactMessage }
  } catch (error) {
    console.error("Failed to submit contact form:", error)
    return { success: false, error: "Failed to submit contact form" }
  }
}

export async function getContactMessages() {
  try {
    const messages = await sql`
      SELECT id, full_name, email, message, is_replied, created_at
      FROM contact_messages
      ORDER BY created_at DESC
    `
    return messages
  } catch (error) {
    console.error("Failed to fetch contact messages:", error)
    return []
  }
}

export async function getContactMessageById(id: number) {
  try {
    const [message] = await sql`
      SELECT id, full_name, email, message, is_replied, created_at
      FROM contact_messages
      WHERE id = ${id}
    `
    return message
  } catch (error) {
    console.error(`Failed to fetch contact message with id ${id}:`, error)
    return null
  }
}

export async function replyToContactMessage(contactMessageId: number, subject: string, message: string) {
  try {
    console.log(`[CONTACT] Starting reply to contact message ${contactMessageId} with subject: ${subject}`)

    // Get the contact message
    const contactMessage = await getContactMessageById(contactMessageId)

    if (!contactMessage) {
      console.error(`[CONTACT] Contact message with ID ${contactMessageId} not found`)
      return { success: false, error: "Contact message not found" }
    }

    console.log(`[CONTACT] Found contact message from: ${contactMessage.email}`)

    // Format the message for HTML (replace newlines with <br>)
    const formattedReplyMessage = message.replace(/\n/g, "<br>")
    const formattedOriginalMessage = contactMessage.message.replace(/\n/g, "<br>")

    // Generate fallback HTML content
    const htmlContent = generateContactReplyEmail(contactMessage.full_name, contactMessage.message, subject, message)

    // Insert the reply - NO TRANSACTION
    console.log("[CONTACT] Inserting reply into database")
    try {
      const [reply] = await sql`
        INSERT INTO admin_replies (contact_message_id, subject, message)
        VALUES (${contactMessageId}, ${subject}, ${message})
        RETURNING id, contact_message_id, subject, message, created_at
      `
      console.log(`[CONTACT] Reply inserted with ID: ${reply.id}`)
    } catch (error) {
      console.error(`[CONTACT] Error inserting reply: ${error}`)
      return { success: false, error: `Failed to insert reply: ${error}` }
    }

    // Update the contact message as replied - NO TRANSACTION
    console.log(`[CONTACT] Marking contact message ${contactMessageId} as replied`)
    try {
      await sql`
        UPDATE contact_messages
        SET is_replied = true
        WHERE id = ${contactMessageId}
      `
      console.log(`[CONTACT] Contact message ${contactMessageId} marked as replied`)
    } catch (error) {
      console.error(`[CONTACT] Error updating contact message: ${error}`)
      // Continue even if this fails
    }

    // Send the reply email using template ID 4 with fallback HTML
    console.log("[CONTACT] Preparing to send email with template ID 4")
    try {
      const emailResult = await sendEmail({
        to: contactMessage.email,
        subject: subject,
        templateId: 4, // Using template ID 4 for contact replies
        params: {
          name: contactMessage.full_name,
          subject: subject,
          replyMessage: formattedReplyMessage,
          originalMessage: formattedOriginalMessage,
          year: new Date().getFullYear().toString(),
        },
        htmlContent: htmlContent, // Fallback HTML content
      })

      console.log(`[CONTACT] Email sending result: ${JSON.stringify(emailResult)}`)

      if (!emailResult.success) {
        console.error(`[CONTACT] Failed to send email: ${JSON.stringify(emailResult.error)}`)
        // Continue even if email sending fails
      }
    } catch (error) {
      console.error(`[CONTACT] Error sending email: ${error}`)
      // Continue even if email sending fails
    }

    console.log("[CONTACT] Reply process completed successfully")
    revalidatePath("/admin/contact")

    return { success: true }
  } catch (error) {
    console.error(`[CONTACT] Failed to reply to contact message with id ${contactMessageId}:`, error)
    return { success: false, error: `Failed to reply to contact message: ${error}` }
  }
}

export async function getRepliesByContactMessageId(contactMessageId: number) {
  try {
    const replies = await sql`
      SELECT id, contact_message_id, subject, message, created_at
      FROM admin_replies
      WHERE contact_message_id = ${contactMessageId}
      ORDER BY created_at DESC
    `
    return replies
  } catch (error) {
    console.error(`Failed to fetch replies for contact message with id ${contactMessageId}:`, error)
    return []
  }
}
