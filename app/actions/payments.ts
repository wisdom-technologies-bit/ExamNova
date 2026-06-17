"use server"

import { sql } from "@/lib/db"
import { createPinForSubject } from "./subjects"
import { sendEmail, generatePaymentSuccessEmail } from "@/lib/email"
import { formatNaira } from "@/lib/utils"

export async function createPayment(
  userEmail: string,
  subjectId: number,
  amount: number,
  transactionReference: string,
  fullName = "",
) {
  try {
    console.log(
      `[PAYMENT] Creating payment for user ${userEmail}, subject ${subjectId}, amount ${amount}, reference ${transactionReference}`,
    )

    // Create a PIN for the subject
    const pinResult = await createPinForSubject(subjectId, userEmail)

    if (!pinResult.success) {
      console.error(`[PAYMENT] Failed to create PIN: ${JSON.stringify(pinResult)}`)
      return { success: false, error: "Failed to create PIN" }
    }

    console.log(`[PAYMENT] PIN created successfully: ${JSON.stringify(pinResult.pin)}`)

    // Create the payment record
    const [payment] = await sql`
      INSERT INTO payments (user_email, subject_id, amount, pin_id, transaction_reference, status)
      VALUES (${userEmail}, ${subjectId}, ${amount}, ${pinResult.pin.id}, ${transactionReference}, 'completed')
      RETURNING id, user_email, subject_id, amount, pin_id, transaction_reference, status, created_at
    `

    console.log(`[PAYMENT] Payment record created with ID: ${payment.id}`)

    // Get subject details for the email
    const [subject] = await sql`
      SELECT title FROM subjects WHERE id = ${subjectId}
    `

    console.log(`[PAYMENT] Subject title: ${subject.title}`)

    // Format expiration date
    const expiresAt = new Date(pinResult.pin.expires_at).toLocaleString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    // Current date formatted
    const currentDate = new Date().toLocaleString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    console.log("[PAYMENT] Preparing to send payment confirmation email")

    // Prepare email parameters
    const name = fullName || userEmail.split("@")[0]
    const formattedAmount = formatNaira(amount)
    const year = new Date().getFullYear().toString()

    // Generate fallback HTML content
    const htmlContent = generatePaymentSuccessEmail(
      name,
      subject.title,
      pinResult.pin.pin_code,
      expiresAt,
      formattedAmount,
    )

    // Send email with PIN using template ID 3 with fallback HTML
    const emailResult = await sendEmail({
      to: userEmail,
      subject: "Your ExamNova Access PIN",
      templateId: 3,
      params: {
        name: name,
        subjectTitle: subject.title,
        pin: pinResult.pin.pin_code,
        expiresAt: expiresAt,
        amount: formattedAmount,
        date: currentDate,
        year: year,
      },
      htmlContent: htmlContent, // Fallback HTML content
    })

    if (!emailResult.success) {
      console.error(`[PAYMENT] Failed to send payment confirmation email: ${JSON.stringify(emailResult.error)}`)
      // Continue with the payment process even if email fails
    } else {
      console.log("[PAYMENT] Payment confirmation email sent successfully")
    }

    return {
      success: true,
      payment,
      pin: pinResult.pin,
    }
  } catch (error) {
    console.error("[PAYMENT] Failed to create payment:", error)
    return { success: false, error: "Failed to create payment" }
  }
}

export async function getPayments() {
  try {
    const payments = await sql`
      SELECT p.id, p.user_email, p.subject_id, p.amount, p.transaction_reference, p.status, p.created_at,
             s.title as subject_title,
             pin.pin_code
      FROM payments p
      JOIN subjects s ON p.subject_id = s.id
      LEFT JOIN pins pin ON p.pin_id = pin.id
      ORDER BY p.created_at DESC
    `
    return payments
  } catch (error) {
    console.error("Failed to fetch payments:", error)
    return []
  }
}

export async function getPaymentByTransactionReference(transactionReference: string) {
  try {
    const [payment] = await sql`
      SELECT p.id, p.user_email, p.subject_id, p.amount, p.transaction_reference, p.status, p.created_at,
             s.title as subject_title,
             pin.pin_code
      FROM payments p
      JOIN subjects s ON p.subject_id = s.id
      LEFT JOIN pins pin ON p.pin_id = pin.id
      WHERE p.transaction_reference = ${transactionReference}
    `
    return payment
  } catch (error) {
    console.error(`Failed to fetch payment with transaction reference ${transactionReference}:`, error)
    return null
  }
}
