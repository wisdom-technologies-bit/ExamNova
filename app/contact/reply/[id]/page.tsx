import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getContactMessageWithReplies } from "@/app/actions/contact-replies"
import { formatDate } from "@/lib/db"
import ReplyForm from "./reply-form"

// Render on-demand instead of at build time
export const revalidate = 0

export const metadata = {
  title: "Reply to Message - ExamNova",
  description: "Continue your conversation with ExamNova support",
}

export default async function ContactReplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const messageId = Number.parseInt(id)

  if (isNaN(messageId)) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<LoadingSkeleton />}>
          <ConversationThread messageId={messageId} />
        </Suspense>
      </div>
    </div>
  )
}

async function ConversationThread({ messageId }: { messageId: number }) {
  const conversation = await getContactMessageWithReplies(messageId)

  if (!conversation) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-green-600 hover:text-green-700 mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Your Conversation</h1>
        <p className="text-slate-600 mt-2">Continue discussing your inquiry with our support team</p>
      </div>

      {/* Conversation Messages */}
      <Card className="border-0 shadow-md">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle>Conversation History</CardTitle>
          <CardDescription>All messages in this thread</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4 max-h-96 overflow-y-auto">
          {/* Original Message */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-slate-900">{conversation.full_name}</p>
                <p className="text-sm text-slate-600">{conversation.email}</p>
              </div>
              <span className="text-xs text-slate-500">{formatDate(conversation.created_at)}</span>
            </div>
            <p className="text-slate-700 whitespace-pre-wrap">{conversation.message}</p>
          </div>

          {/* Admin Replies */}
          {conversation.replies && conversation.replies.length > 0 && (
            <div className="space-y-3 mt-6">
              {conversation.replies.map((reply: any, index: number) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    reply.sender_type === "admin"
                      ? "bg-green-50 border-green-200"
                      : "bg-slate-100 border-slate-200 ml-6"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {reply.sender_type === "admin" ? "ExamNova Team" : reply.sender_name || "You"}
                      </p>
                      <p className="text-sm text-slate-600">{reply.sender_email}</p>
                    </div>
                    <span className="text-xs text-slate-500">{formatDate(reply.created_at)}</span>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap">{reply.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reply Form */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Send Your Reply</CardTitle>
          <CardDescription>Share your response with our support team</CardDescription>
        </CardHeader>
        <CardContent>
          <ReplyForm contactMessageId={messageId} userEmail={conversation.email} userName={conversation.full_name} />
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card className="border-0 shadow-md bg-blue-50 border border-blue-200">
        <CardContent className="p-6">
          <p className="text-sm text-slate-700">
            <strong>Note:</strong> Your reply will be sent to our support team. We typically respond within 24 hours.
            You can track your message status on the home page.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Skeleton className="h-10 w-40 mb-4" />
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-6 w-96" />
      </div>

      <div className="rounded-lg border shadow">
        <div className="p-6 border-b space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border shadow p-6 space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  )
}
