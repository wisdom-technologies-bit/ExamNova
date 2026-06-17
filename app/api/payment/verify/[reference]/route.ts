import { type NextRequest, NextResponse } from "next/server"
import { verifySquadPayment } from "@/lib/payment"
import { createPayment } from "@/app/actions/payments"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest, { params }: { params: { reference: string } }) {
  try {
    const reference = params.reference
    logger.info(`Verifying payment with reference: ${reference}`)

    // Verify payment with SquadCo
    const verificationResult = await verifySquadPayment(reference)
    console.log("VERIFIED DATA", verificationResult)
    logger.info(`Payment verification result: ${JSON.stringify(verificationResult)}`)

    if (
      !verificationResult.success ||
        verificationResult.data.transaction_status !== "success") {
      logger.error(`Payment verification failed for reference: ${reference}`)
      return NextResponse.json({ success: false, error: "Payment verification failed" })
    }

    // Extract payment details from verification result
    const { data } = verificationResult
    const metadata = data.meta || {}

    logger.info(`Creating payment record for subject ID: ${metadata.subjectId}`)

    const subjectId = Number(metadata.subjectId)

    if (isNaN(subjectId)) {
      logger.error(`Invalid subjectId: ${metadata.subjectId}`)
        return NextResponse.json({ success: false, error: "Invalid subject ID" })
        }

        const paymentResult = await createPayment(
          data.email,
            subjectId,
              data.transaction_amount / 100, // Convert from kobo to naira
                reference,
                  metadata.fullName || "",
                  )

    if (!paymentResult.success) {
      logger.error(`Failed to create payment record for reference: ${reference}`)
      return NextResponse.json({ success: false, error: "Failed to create payment record" })
    }

    logger.info(`Payment record created successfully for reference: ${reference}`)
    return NextResponse.json({
      success: true,
      pin: paymentResult.pin.pin_code,
      subject_title: metadata.subjectTitle || "Subject",
    })
  } catch (error) {
    logger.error(`Error verifying payment: ${error}`)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
