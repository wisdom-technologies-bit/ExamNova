"use server"

import { env } from "@/lib/env"

// Server-side only function to verify a payment
export async function verifySquadPayment(transactionRef: string) {
  try {
    const response = await fetch(`https://api-d.squadco.com/transaction/verify/${transactionRef}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer sk_340dc3fab25f29285498db392392882d56a223b7`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("Failed to verify payment:", error)
      return { success: false, error }
    }

    const json = await response.json()
    return { success: true, data: json.data }
  } catch (error) {
    console.error("Error verifying payment:", error)
    return { success: false, error }
  }
}
