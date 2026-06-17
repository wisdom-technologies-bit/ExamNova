"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import Script from "next/script"

// Define Squad type
declare global {
  interface Window {
    Squad: any
  }
}

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters" }),
})

export default function PaymentForm({ subject }: { subject: any }) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [squadPublicKey, setSquadPublicKey] = useState<string>("")
  const [isConfigLoading, setIsConfigLoading] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      fullName: "",
    },
  })

  // Fetch Squad public key from server
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/payment/config")
        const data = await response.json()
        setSquadPublicKey(data.publicKey)
        console.log("Payment config loaded")
      } catch (error) {
        console.error("Failed to load payment configuration:", error)
        toast({
          variant: "destructive",
          title: "Configuration Error",
          description: "Failed to load payment configuration. Please try again later.",
        })
      } finally {
        setIsConfigLoading(false)
      }
    }

    fetchConfig()
  }, [toast])

  // Handle Squad script loading
  const handleScriptLoad = () => {
    console.log("Squad script loaded successfully")
    setScriptLoaded(true)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Payment form submitted:", values)
    setIsLoading(true)

    try {
      if (!window.Squad) {
        console.error("Squad script not loaded")
        toast({
          variant: "destructive",
          title: "Payment Failed",
          description: "Payment system not available. Please try again later.",
        })
        setIsLoading(false)
        return
      }

      if (!squadPublicKey) {
        console.error("Squad public key not available")
        toast({
          variant: "destructive",
          title: "Payment Failed",
          description: "Payment configuration is incomplete. Please try again later.",
        })
        setIsLoading(false)
        return
      }

      console.log("Initiating Squad payment for subject:", subject.id, subject.title)
      console.log("Payment amount:", Number(subject.price))

      // Create transaction reference
      const transactionRef = `EXAMNOVA-${Date.now()}-${Math.floor(Math.random() * 1000)}`

      // Initialize Squad payment
      const squadInstance = new window.Squad({
        onClose: () => {
          console.log("Payment widget closed")
          setIsLoading(false)
        },
        onLoad: () => console.log("Payment widget loaded successfully"),
        onSuccess: async (response: any) => {
          console.log("Payment successful:", response)

          // Verify payment on server
          try {
            const verifyResponse = await fetch(`/api/payment/verify/${response.transaction_ref || transactionRef}`)
            const verifyData = await verifyResponse.json()

            if (verifyData.success) {
              // Redirect to success page
              window.location.href = `/payment/success?reference=${response.transaction_ref || transactionRef}`
            } else {
              toast({
                variant: "destructive",
                title: "Payment Verification Failed",
                description: "We couldn't verify your payment. Please contact support.",
              })
              setIsLoading(false)
            }
          } catch (error) {
            console.error("Payment verification error:", error)
            toast({
              variant: "destructive",
              title: "Payment Verification Error",
              description: "An error occurred while verifying your payment.",
            })
            setIsLoading(false)
          }
        },
        key: squadPublicKey,
        email: values.email,
        amount: Number(subject.price) * 100, // Convert to kobo
        currency_code: "NGN",
        transaction_ref: transactionRef,
        metadata: {
          subjectId: subject.id,
          subjectTitle: subject.title,
          fullName: values.fullName,
        },
      })

      console.log("Setting up Squad payment...")
      squadInstance.setup()
      console.log("Opening Squad payment widget...")
      squadInstance.open()
    } catch (error) {
      console.error("Payment initiation error:", error)
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      })
      setIsLoading(false)
    }
  }

  return (
    <>
      <Script
        src="https://checkout.squadco.com/widget/squad.min.js"
        onLoad={handleScriptLoad}
        strategy="afterInteractive"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} />
                </FormControl>
                <FormDescription>Your PIN will be sent to this email address.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isLoading || !scriptLoaded || isConfigLoading}
          >
            {isLoading
              ? "Processing..."
              : !scriptLoaded || isConfigLoading
                ? "Loading Payment System..."
                : `Pay ${new Intl.NumberFormat("en-NG", {
                    style: "currency",
                    currency: "NGN",
                    minimumFractionDigits: 0,
                  }).format(Number(subject.price))}`}
          </Button>
        </form>
      </Form>
    </>
  )
}
