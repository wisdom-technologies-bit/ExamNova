import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getContactMessages } from "@/app/actions/contact"
import { formatDate } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"

export default async function ContactMessagesPage() {
  const messages = await getContactMessages()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Contact Messages</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Contact Messages</CardTitle>
          <CardDescription>View and respond to contact form submissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Email</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                    <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <tr
                        key={message.id}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        <td className="p-4 align-middle font-medium">{message.full_name}</td>
                        <td className="p-4 align-middle">{message.email}</td>
                        <td className="p-4 align-middle">{formatDate(message.created_at)}</td>
                        <td className="p-4 align-middle">
                          {message.is_replied ? (
                            <Badge className="bg-green-600">Replied</Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-600">
                              Pending
                            </Badge>
                          )}
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Link href={`/admin/contact/${message.id}`}>
                            <Button size="sm" variant="outline" className="h-8">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">
                        No messages found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
