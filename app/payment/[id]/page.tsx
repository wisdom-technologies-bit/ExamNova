import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getSubjectById } from "@/app/actions/subjects"
import { formatNaira } from "@/lib/utils"
import { notFound } from "next/navigation"
import PaymentForm from "./payment-form"

export default async function PaymentPage({ params }: { params: { id: string } }) {
  const subjectId = Number.parseInt(params.id)

  if (isNaN(subjectId)) {
    notFound()
  }

  return (
    <div className="container py-10">
      <Suspense fallback={<PaymentDetailSkeleton />}>
        <PaymentDetail subjectId={subjectId} />
      </Suspense>
    </div>
  )
}

async function PaymentDetail({ subjectId }: { subjectId: number }) {
  const subject = await getSubjectById(subjectId)

  if (!subject) {
    notFound()
  }

  return (
    <div>
      <Link href={`/subjects/${subject.id}`} className="flex items-center text-green-600 hover:text-green-700 mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Subject
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Review your order details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {subject.image_url && (
                  <Image
                    src={subject.image_url || "/placeholder.svg?height=100&width=100"}
                    alt={subject.title}
                    width={100}
                    height={100}
                    className="rounded-md object-cover w-24 h-24"
                  />
                )}
                <div>
                  <h3 className="font-semibold">{subject.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {subject.subcategory_name} - {subject.category_name}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Subject Price</span>
                  <span>{formatNaira(Number(subject.price))}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">{formatNaira(Number(subject.price))}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>Complete your payment to receive your PIN</CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentForm subject={subject} />
          </CardContent>
          <CardFooter className="flex flex-col text-sm text-muted-foreground">
            <p>After payment, you will:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Receive a unique PIN via email and WhatsApp</li>
              <li>Use the PIN to access the subject content</li>
              <li>Have 24-hour access to the content</li>
            </ul>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

function PaymentDetailSkeleton() {
  return (
    <div>
      <div className="flex items-center mb-4">
        <Skeleton className="h-4 w-4 mr-2" />
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Skeleton className="w-24 h-24 rounded-md" />
                <div>
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-60 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
          <CardFooter>
            <div className="space-y-2 w-full">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
