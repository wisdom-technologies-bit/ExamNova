"use server"

import { sql } from "@/lib/db"
import { sendEmail } from "@/lib/email"
import { logger } from "@/lib/logger"

// Get all users who have bought PINs (successful or not)
export async function getPINBuyersForCampaign() {
  try {
    const users = await sql`
      SELECT DISTINCT
        p.user_email as email,
        p.created_at,
        COUNT(*) as pin_count,
        STRING_AGG(DISTINCT pay.status, ', ') as payment_statuses
      FROM pins p
      LEFT JOIN payments pay ON p.id = pay.pin_id
      WHERE p.user_email IS NOT NULL AND p.user_email != ''
      GROUP BY p.user_email, p.created_at
      ORDER BY p.created_at DESC
    `

    return {
      success: true,
      users: users || [],
      count: users?.length || 0,
    }
  } catch (error) {
    logger.error(`[CAMPAIGN] Failed to fetch PIN buyers:`, error)
    return {
      success: false,
      error: "Failed to fetch recipients",
      users: [],
      count: 0,
    }
  }
}

// Generate campaign email HTML with header and footer
export function generateCampaignEmail(
  recipientName: string,
  subject: string,
  message: string,
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${subject}</title>
        <style>
          @media (max-width: 600px) {
            .container { padding: 10px !important; }
            .content { padding: 20px !important; }
            h1 { font-size: 24px !important; }
            h2 { font-size: 20px !important; }
            p { font-size: 14px !important; }
          }
        </style>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px;">
        <div class="container" style="max-width: 600px; margin: 0 auto;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 12px 12px 0 0; padding: 40px 20px; text-align: center; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);">
            <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700;">ExamNova</h1>
            <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; letter-spacing: 1px;">Educational Excellence</p>
          </div>

          <!-- Main Content -->
          <div class="content" style="background-color: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #111827; margin: 0 0 20px 0; font-size: 24px;">${subject}</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
              Dear ${recipientName},
            </p>

            <!-- Message Content -->
            <div style="background-color: #f8fafc; border-left: 4px solid #22c55e; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <div style="color: #1e293b; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">
                ${message.replace(/\n/g, "<br>")}
              </div>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://www.examnova.name.ng" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 10px rgba(34, 197, 94, 0.3); transition: all 0.3s ease;">
                Visit ExamNova
              </a>
            </div>

            <!-- Divider -->
            <div style="height: 1px; background-color: #e2e8f0; margin: 30px 0;"></div>

            <!-- Footer Message -->
            <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 20px 0;">
              We appreciate your support and continued trust in ExamNova. If you have any questions or need assistance, please don't hesitate to reach out to us.
            </p>

            <p style="color: #64748b; font-size: 13px; margin: 15px 0;">
              Best regards,<br>
              <strong>The ExamNova Team</strong>
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #1e293b; color: #cbd5e1; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; font-size: 12px;">
            <p style="margin: 0 0 10px 0;">
              <a href="https://www.examnova.name.ng" style="color: #22c55e; text-decoration: none; font-weight: 600;">www.examnova.name.ng</a>
            </p>
            <p style="margin: 0; color: #94a3b8;">
              © ${new Date().getFullYear()} ExamNova. All rights reserved.
            </p>
            <p style="margin: 10px 0 0 0; color: #64748b; font-size: 11px;">
              You received this email because you're valued member of ExamNova community.
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}

// Send campaign email to all PIN buyers
export async function sendCampaignEmails(
  subject: string,
  message: string,
  recipientEmails?: string[],
) {
  try {
    logger.info(`[CAMPAIGN] Starting campaign send: ${recipientEmails?.length || 'all'} recipients`)

    // Get recipients
    let emails: string[] = []

    if (recipientEmails && recipientEmails.length > 0) {
      emails = recipientEmails
    } else {
      const result = await getPINBuyersForCampaign()
      if (!result.success || !result.users) {
        return {
          success: false,
          error: "Failed to fetch recipients",
          sent: 0,
          failed: 0,
        }
      }
      emails = result.users.map((u: any) => u.email)
    }

    if (emails.length === 0) {
      return {
        success: false,
        error: "No recipients found",
        sent: 0,
        failed: 0,
      }
    }

    logger.info(`[CAMPAIGN] Sending to ${emails.length} recipients`)

    let sent = 0
    let failed = 0
    const failures: Array<{ email: string; error: string }> = []

    // Send emails in batches
    for (const email of emails) {
      try {
        // Extract name from email or use default
        const name = email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1)

        const htmlContent = generateCampaignEmail(name, subject, message)

        const result = await sendEmail({
          to: email,
          subject: subject,
          htmlContent: htmlContent,
        })

        if (result.success) {
          sent++
          logger.info(`[CAMPAIGN] Email sent to ${email}`)
        } else {
          failed++
          failures.push({ email, error: String(result.error) })
          logger.error(`[CAMPAIGN] Failed to send to ${email}:`, result.error)
        }
      } catch (error) {
        failed++
        failures.push({ email, error: String(error) })
        logger.error(`[CAMPAIGN] Exception sending to ${email}:`, error)
      }
    }

    logger.info(`[CAMPAIGN] Campaign complete: ${sent} sent, ${failed} failed`)

    return {
      success: sent > 0,
      sent,
      failed,
      total: emails.length,
      failures: failures.length > 0 ? failures : undefined,
    }
  } catch (error) {
    logger.error(`[CAMPAIGN] Campaign error:`, error)
    return {
      success: false,
      error: String(error),
      sent: 0,
      failed: 0,
    }
  }
}
