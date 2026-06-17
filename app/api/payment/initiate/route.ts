import { type NextRequest, NextResponse } from "next/server"
import { env } from "@/lib/env"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, email, fullName, subjectId, subjectTitle } = body

    logger.info(
      `Payment initiation request received: ${JSON.stringify({
        amount,
        email,
        subjectId,
        subjectTitle,
      })}`,
    )

    // Validate required fields
    if (!amount || !email || !subjectId) {
      logger.error("Missing required fields for payment initiation")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate a unique transaction reference
    const transactionRef = `EXAMNOVA-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    logger.info(`Generated transaction reference: ${transactionRef}`)

    // Initiate payment with SquadCo
    logger.info(`Sending request to SquadCo API with amount: ${amount * 100} kobo`)
    const response = await fetch("https://api.squadco.com/payment/initiate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.SQUADCO_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to kobo
        email,
        currency: "NGN",
        initiate_type: "checkout", // Use checkout instead of inline
        transaction_ref: transactionRef,
        customer: {
          name: fullName || email.split("@")[0],
          email,
        },
        metadata: {
          subjectId,
          subjectTitle,
          fullName,
        },
        callback_url: `${env.APP_URL}/payment/success`,
        return_url: `${env.APP_URL}/payment/success?reference=${transactionRef}`,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      logger.error("Failed to initiate payment with SquadCo:", error)
      return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 })
    }

    const data = await response.json()
    logger.info(`Payment initiation successful. Checkout URL: ${data.data?.checkout_url}`)

    // Return only what's needed by the client
    return NextResponse.json({
      checkout_url: data.data.checkout_url,
      transaction_ref: transactionRef,
    })
  } catch (error) {
    logger.error("Error initiating payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
