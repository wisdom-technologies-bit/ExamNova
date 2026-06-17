import { type NextRequest, NextResponse } from "next/server"
import { createPayment } from "@/app/actions/payments"

export async function POST(request: NextRequest) {
  try {
      const body = await request.json()

          if (body.transaction_status !== "success") {
                return NextResponse.json({ success: false, message: "Payment not successful" })
                    }

                        const { meta, email, transaction_ref, transaction_amount } = body

                            if (!meta || !meta.subjectId || !email) {
                                  return NextResponse.json({ success: false, message: "Invalid metadata" })
                                      }

                                          const paymentResult = await createPayment(
                                                email,
                                                      meta.subjectId,
                                                            transaction_amount / 100,
                                                                  transaction_ref,
                                                                        meta.fullName || "",
                                                                            )

                                                                                if (!paymentResult.success) {
                                                                                      return NextResponse.json({ success: false, message: "Failed to create payment record" })
                                                                                          }

                                                                                              return NextResponse.json({
                                                                                                    success: true,
                                                                                                          message: "Payment processed successfully",
                                                                                                              })
                                                                                                                } catch (error) {
                                                                                                                    console.error("Error processing SquadCo webhook:", error)
                                                                                                                        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
                                                                                                                          }
                                                                                                                          }
