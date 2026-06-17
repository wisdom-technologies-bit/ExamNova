import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getContactMessageById, getRepliesByContactMessageId } from "@/app/actions/contact"
import { formatDate } from "@/lib/db"
import { ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import ReplyForm from "./reply-form"

// Render on-demand instead of at build time
export const revalidate = 0

export default async function ContactMessageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const messageId = Number.parseInt(id)

  if (isNaN(messageId)) {
    notFound()
  }

  const message = await getContactMessageById(messageId)

  if (!message) {
    notFound()
  }

  const replies = await getRepliesByContactMessageId(messageId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/admin/contact">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Message Details</h1>
        </div>
        <Badge className={message.is_replied ? "bg-green-600" : "bg-amber-600"}>
          {message.is_replied ? "Replied" : "Pending"}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Message</CardTitle>
            <CardDescription>
              From {message.full_name} ({message.email}) on {formatDate(message.created_at)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap rounded-md border p-4">{message.message}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reply</CardTitle>
            <CardDescription>Send a reply to this message</CardDescription>
          </CardHeader>
          <CardContent>
            <ReplyForm messageId={messageId} isReplied={message.is_replied} userEmail={message.email} />
          </CardContent>
        </Card>
      </div>

      {replies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Previous Replies</CardTitle>
            <CardDescription>History of replies sent to this message</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {replies.map((reply) => (
                <div key={reply.id} className="rounded-md border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold">{reply.subject}</h3>
                    <span className="text-sm text-muted-foreground">{formatDate(reply.created_at)}</span>
                  </div>
                  <div className="whitespace-pre-wrap">{reply.message}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
