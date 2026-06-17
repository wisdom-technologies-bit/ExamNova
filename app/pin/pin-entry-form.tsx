"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { validatePin } from "@/app/actions/subjects"

const formSchema = z.object({
  pin: z.string().min(6, { message: "PIN must be at least 6 characters" }),
})

export default function PinEntryForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pin: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const result = await validatePin(values.pin)

      if (result.success) {
        toast({
          title: "PIN Validated",
          description: "You now have access to the subject content.",
        })

        // Redirect to content page
        router.push(`/content/${result.pin.subject_id}?pin=${values.pin}`)
      } else {
        toast({
          variant: "destructive",
          title: "Invalid PIN",
          description: result.error || "Please double-check and try again.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your PIN</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your PIN"
                  {...field}
                  className="text-center tracking-wider text-lg"
                  autoComplete="off"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
          {isLoading ? "Validating..." : "Access Content"}
        </Button>
      </form>
    </Form>
  )
}
