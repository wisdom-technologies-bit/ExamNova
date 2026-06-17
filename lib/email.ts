import { env } from "@/lib/env"

type EmailParams = {
  to: string
  subject: string
  htmlContent?: string
  templateId?: number
  params?: Record<string, any>
  sender?: {
    name: string
    email: string
  }
}

export async function sendEmail({ to, subject, htmlContent, templateId, params, sender }: EmailParams) {
  try {
    console.log(`[EMAIL] Sending email to ${to} with subject: ${subject}`)

    // Validate required parameters
    if (!to) {
      console.error("[EMAIL] Missing recipient email address")
      return { success: false, error: "Missing recipient email address" }
    }

    if (!env.BREVO_API_KEY) {
      console.error("[EMAIL] BREVO_API_KEY is not set in environment variables")
      return { success: false, error: "API key not configured" }
    }

    const defaultSender = {
      name: "ExamNova",
      email: "hello@examnova.name.ng",
    }

    // Prepare the request body
    let requestBody: any = {
      sender: sender || defaultSender,
      to: [{ email: to }],
      subject,
    }

    // If templateId is provided, use template-based email
    if (templateId) {
      console.log(`[EMAIL] Using template ID ${templateId}`)
      requestBody = {
        ...requestBody,
        templateId,
        params: params || {},
      }
      console.log(`[EMAIL] Template params:`, JSON.stringify(params, null, 2))
    } else if (htmlContent) {
      // Otherwise use raw HTML content
      console.log("[EMAIL] Using raw HTML content")
      requestBody = {
        ...requestBody,
        htmlContent,
      }
    } else {
      console.error("[EMAIL] Neither templateId nor htmlContent provided")
      return { success: false, error: "No content provided for email" }
    }

    console.log("[EMAIL] Sending request to Brevo API")

    // Send the email using Brevo API
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": env.BREVO_API_KEY,
      },
      body: JSON.stringify(requestBody),
    })

    const responseStatus = response.status
    console.log(`[EMAIL] Brevo API response status: ${responseStatus}`)

    // Try to parse the response as JSON
    let responseData
    try {
      const responseText = await response.text()
      console.log(`[EMAIL] Brevo API response body: ${responseText}`)

      try {
        responseData = JSON.parse(responseText)
      } catch (e) {
        responseData = { rawResponse: responseText }
      }
    } catch (e) {
      console.error("[EMAIL] Failed to read response body:", e)
      responseData = { error: "Failed to read response body" }
    }

    // Check if the request was successful
    if (!response.ok) {
      console.error(`[EMAIL] Failed to send email (${responseStatus}):`, responseData)

      // If template-based email failed, try fallback to direct HTML
      if (templateId && htmlContent) {
        console.log("[EMAIL] Attempting fallback to direct HTML email")
        return await sendEmail({
          to,
          subject,
          htmlContent,
          sender,
        })
      }

      return {
        success: false,
        error: responseData,
        status: responseStatus,
      }
    }

    console.log("[EMAIL] Email sent successfully")
    return { success: true, messageId: responseData?.messageId }
  } catch (error) {
    console.error("[EMAIL] Exception while sending email:", error)
    return { success: false, error: String(error) }
  }
}

// Generate HTML for payment success email (used as fallback)
export function generatePaymentSuccessEmail(
  name: string,
  subjectTitle: string,
  pin: string,
  expiresAt: string,
  amount: string,
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Payment Successful</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f3f4f6; color: #111827; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);">
          <div style="background-color: #22c55e; color: white; padding: 30px 20px; text-align: center;">
            <h1>ExamNova</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Payment Successful!</h2>
            <p>Hello ${name},</p>
            <p>Your purchase for <strong>${subjectTitle}</strong> has been confirmed.</p>

            <div style="background-color: #ecfdf5; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
              <h2 style="color: #16a34a; margin-bottom: 10px;">Your Access PIN</h2>
              <div style="font-size: 24px; font-weight: bold; color: #111827; letter-spacing: 2px;">${pin}</div>
              <p>Expires on: <strong>${expiresAt}</strong></p>
            </div>

            <h3>Payment Details</h3>
            <ul>
              <li><strong>Subject:</strong> ${subjectTitle}</li>
              <li><strong>Amount Paid:</strong> ${amount}</li>
              <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
            </ul>

            <p style="margin-top: 20px;">
              You can use your PIN to access your materials immediately by clicking the button below.
            </p>

            <div style="text-align: center;">
              <a href="https://examnova.vercel.app/pin" style="display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">Enter PIN Now</a>
            </div>

            <p style="margin-top: 30px;">
              For support, contact us at hello@examnova.name.ng or reply to this email.
            </p>
          </div>
          <div style="font-size: 12px; color: #6b7280; text-align: center; padding: 20px;">
            <p>&copy; ${new Date().getFullYear()} ExamNova. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

// Generate HTML for contact reply email with conversation history
export function generateContactReplyEmail(
  name: string,
  originalMessage: string,
  replySubject: string,
  replyMessage: string,
  conversationHistory: any[] = [],
  replyUrl?: string,
) {
  const conversationHtml = conversationHistory
    .map(
      (reply: any) => `
    <div style="background-color: ${reply.sender_type === "admin" ? "#ecfdf5" : "#f3f4f6"}; padding: 12px; border-radius: 4px; margin: 10px 0; border-left: 4px solid ${reply.sender_type === "admin" ? "#22c55e" : "#6b7280"};">
      <p style="margin: 0 0 5px 0;"><strong>${reply.sender_type === "admin" ? "ExamNova Team" : "You"}:</strong></p>
      <p style="margin: 0; white-space: pre-wrap;">${reply.message.replace(/\n/g, "<br>")}</p>
      <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">${new Date(reply.created_at).toLocaleString()}</p>
    </div>
  `,
    )
    .join("")

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Response to Your Inquiry</title>
        <style>
          @media (max-width: 600px) {
            .container { padding: 10px !important; }
            .content { padding: 15px !important; }
            h2 { font-size: 18px !important; }
          }
        </style>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f3f4f6; color: #111827; margin: 0; padding: 0;">
        <div class="container" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);">
          <div style="background-color: #22c55e; color: white; padding: 30px 20px; text-align: center;">
            <h1>ExamNova</h1>
          </div>
          <div class="content" style="padding: 20px;">
            <h2>${replySubject}</h2>
            <p>Hello ${name},</p>
            <p>Thank you for contacting us. Here is our response to your inquiry:</p>

            <div style="background-color: #ecfdf5; padding: 15px; border-radius: 6px; margin: 20px 0;">
              ${replyMessage.replace(/\n/g, "<br>")}
            </div>

            ${
              conversationHistory.length > 0
                ? `
            <h3 style="margin-top: 30px; margin-bottom: 10px;">Conversation History</h3>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; max-height: 400px; overflow-y: auto;">
              ${conversationHtml}
            </div>
            `
                : ""
            }

            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #9ca3af;">
              <p style="margin: 0 0 5px 0;"><strong>Your original message:</strong></p>
              <p style="margin: 0; white-space: pre-wrap;">${originalMessage.replace(/\n/g, "<br>")}</p>
            </div>

            ${
              replyUrl
                ? `
            <div style="text-align: center;">
              <a href="${replyUrl}" style="display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">Reply to This Message</a>
            </div>
            `
                : ""
            }

            <p style="margin-top: 20px;">
              If you have any further questions, please don't hesitate to contact us again.
            </p>
          </div>
          <div style="font-size: 12px; color: #6b7280; text-align: center; padding: 20px;">
            <p>&copy; ${new Date().getFullYear()} ExamNova. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

// Send contact reply email with conversation history
export async function sendContactReplyEmail(
  to: string,
  name: string,
  replyMessage: string,
  replyUrl: string,
  conversationHistory: any[] = [],
  originalMessage: string = "",
) {
  const htmlContent = generateContactReplyEmail(
    name,
    originalMessage,
    "We Have Responded to Your Inquiry",
    replyMessage,
    conversationHistory,
    replyUrl,
  )

  return await sendEmail({
    to,
    subject: "Response to Your ExamNova Inquiry",
    htmlContent,
  })
}
