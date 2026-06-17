"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { addContactReply } from "@/app/actions/contact-replies"

export default function ReplyForm({
  contactMessageId,
  userEmail,
  userName,
}: {
  contactMessageId: number
  userEmail: string
  userName: string
}) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!message.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a message",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await addContactReply(contactMessageId, userEmail, userName, message, "user")

      if (result.success) {
        toast({
          title: "Success",
          description: "Your reply has been sent successfully. We'll respond soon!",
        })
        setMessage("")
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to send reply. Please try again.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
          Your Message
        </label>
        <Textarea
          id="message"
          placeholder="Type your reply here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isLoading}
          className="min-h-32 resize-none"
          maxLength={5000}
        />
        <p className="text-xs text-slate-500 mt-1">{message.length} / 5000 characters</p>
      </div>

      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send Reply"}
      </Button>

      <p className="text-xs text-slate-600 text-center">
        Your message will be sent to our support team at {userEmail}
      </p>
    </form>
  )
}
