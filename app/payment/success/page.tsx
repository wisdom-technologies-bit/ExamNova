import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getPaymentByTransactionReference } from "@/app/actions/payments"
import { redirect } from "next/navigation"
import { createPayment } from "@/app/actions/payments"
import { verifySquadPayment } from "@/lib/payment"

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { reference?: string }
}) {
  const reference = searchParams.reference

  if (!reference) {
    redirect("/")
  }

  // First check if we already have this payment in our database
  let payment = await getPaymentByTransactionReference(reference)

  // If not, verify with SquadCo and create the payment
  if (!payment) {
    const verificationResult = await verifySquadPayment(reference)

    if (!verificationResult.success || verificationResult.data.status !== "success") {
      // Payment verification failed, redirect to home
      redirect("/")
    }

    // Extract payment details from verification result
    const { data } = verificationResult
    const metadata = data.metadata || {}

    // Create payment record and PIN
    const paymentResult = await createPayment(
      data.customer.email,
      Number(metadata.subjectId),
      data.amount / 100, // Convert from kobo to naira
      reference,
      metadata.fullName || data.customer.name || "",
    )

    if (!paymentResult.success) {
      // Failed to create payment record
      redirect("/")
    }

    payment = {
      transaction_reference: reference,
      amount: data.amount / 100,
      subject_title: metadata.subjectTitle || "Subject",
      pin_code: paymentResult.pin.pin_code,
    }
  }

  return (
    <div className="container py-10 max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>Your payment has been processed successfully.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 rounded-md">
            <p className="text-center font-semibold mb-2">Your PIN</p>
            <p className="text-center text-2xl font-bold tracking-wider">{payment.pin_code}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subject:</span>
              <span className="font-medium">{payment.subject_title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  minimumFractionDigits: 0,
                }).format(Number(payment.amount))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reference:</span>
              <span className="font-medium">{payment.transaction_reference}</span>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-md text-sm">
            <p>We've sent your PIN to your email address. You can use this PIN to access the subject content.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Link href="/pin" className="w-full">
            <Button className="w-full bg-green-600 hover:bg-green-700">Enter PIN Now</Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full">
              Return to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
