import { type NextRequest, NextResponse } from "next/server"
import { verifySquadPayment } from "@/lib/payment"
import { createPayment } from "@/app/actions/payments"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transactionRef, email, metadata } = body

    // Verify payment with SquadCo
    const verificationResult = await verifySquadPayment(transactionRef)
    console.log("VERIFIED DATA", verificationResult)

    if (
      !verificationResult.success ||
        verificationResult.data.transaction_status !== "success") {
      return NextResponse.json({ success: false, message: "Payment verification failed" }, { status: 400 })
    }

    // Create payment record and PIN
    const paymentResult = await createPayment(
      email,
      metadata.subjectId,
      verificationResult.data.amount / 100, // Convert from kobo to naira
      transactionRef,
      metadata.fullName || "",
    )

    if (!paymentResult.success) {
      return NextResponse.json({ success: false, message: "Failed to create payment record" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and processed successfully",
      pin: paymentResult.pin.pin_code,
    })
  } catch (error) {
    console.error("Error processing payment webhook:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
