"use server"

import { sql } from "@/lib/db"
import { logger } from "@/lib/logger"
import { sendContactReplyEmail } from "@/lib/email"

export async function getRepliesByContactMessageId(contactMessageId: number) {
  try {
    logger.info(`[CONTACT_REPLIES] Fetching replies for contact message ${contactMessageId}`)

    const replies = await sql`
      SELECT *
      FROM contact_message_replies
      WHERE contact_message_id = ${contactMessageId}
      ORDER BY created_at ASC
    `

    logger.info(`[CONTACT_REPLIES] Retrieved ${replies.length} replies`)
    return replies
  } catch (error) {
    logger.error(
      `[CONTACT_REPLIES] Failed to fetch replies:`,
      error instanceof Error ? error.message : String(error),
    )
    return []
  }
}

export async function getContactMessageWithReplies(contactMessageId: number) {
  try {
    logger.info(`[CONTACT_REPLIES] Fetching contact message ${contactMessageId} with all replies`)

    const [message] = await sql`
      SELECT *
      FROM contact_messages
      WHERE id = ${contactMessageId}
    `

    if (!message) {
      return null
    }

    const replies = await sql`
      SELECT *
      FROM contact_message_replies
      WHERE contact_message_id = ${contactMessageId}
      ORDER BY created_at ASC
    `

    return {
      ...message,
      replies,
    }
  } catch (error) {
    logger.error(
      `[CONTACT_REPLIES] Failed to fetch contact message with replies:`,
      error instanceof Error ? error.message : String(error),
    )
    return null
  }
}

export async function addContactReply(
  contactMessageId: number,
  senderEmail: string,
  senderName: string,
  message: string,
  senderType: "admin" | "user" = "user",
) {
  try {
    logger.info(`[CONTACT_REPLIES] Adding reply from ${senderType} to contact message ${contactMessageId}`)

    const [reply] = await sql`
      INSERT INTO contact_message_replies (
        contact_message_id,
        sender_type,
        sender_email,
        sender_name,
        message,
        created_at
      )
      VALUES (
        ${contactMessageId},
        ${senderType},
        ${senderEmail},
        ${senderName},
        ${message},
        CURRENT_TIMESTAMP
      )
      RETURNING *
    `

    logger.info(`[CONTACT_REPLIES] Reply added successfully with ID ${reply.id}`)

    // Get the full conversation for email
    const conversation = await getContactMessageWithReplies(contactMessageId)

    if (conversation && senderType === "admin") {
      // Send email to user with conversation history
      const userReplyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://www.examnova.name.ng"}/contact/reply/${contactMessageId}`

      await sendContactReplyEmail(
        conversation.email,
        conversation.full_name,
        message,
        userReplyUrl,
        conversation.replies || [],
      )

      // Update is_replied flag
      await sql`
        UPDATE contact_messages
        SET is_replied = true
        WHERE id = ${contactMessageId}
      `
    }

    return { success: true, reply }
  } catch (error) {
    logger.error(
      `[CONTACT_REPLIES] Failed to add reply:`,
      error instanceof Error ? error.message : String(error),
    )
    return { success: false, error: "Failed to add reply" }
  }
}

export async function markReplyAsRead(replyId: number) {
  try {
    await sql`
      UPDATE contact_message_replies
      SET is_read = true
      WHERE id = ${replyId}
    `
    return { success: true }
  } catch (error) {
    logger.error(
      `[CONTACT_REPLIES] Failed to mark reply as read:`,
      error instanceof Error ? error.message : String(error),
    )
    return { success: false }
  }
}
