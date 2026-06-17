"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { loginAdmin } from "@/app/actions/admin"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

export default function AdminAccessPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  // Clear any error when the component mounts
  useEffect(() => {
    setLoginError(null)
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setLoginError(null)

    console.log("Submitting login form with email:", values.email)

    try {
      const result = await loginAdmin(values.email, values.password)
      console.log("Login result:", result)

      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome to the admin dashboard.",
          duration: 5000,
        })

        // Add a small delay before redirecting to ensure the toast is shown
        setTimeout(() => {
          router.push("/admin")
        }, 500)
      } else {
        console.log("Login failed:", result.error)
        setLoginError(result.error || "Invalid credentials. Please try again.")

        toast({
          variant: "destructive",
          title: "Login Failed",
          description: result.error || "Invalid credentials. Please try again.",
          duration: 5000,
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      setLoginError("Something went wrong. Please try again.")

      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-10 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Admin Access</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the admin dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">{loginError}</div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          <p>This area is restricted to authorized administrators only.</p>
        </CardFooter>
      </Card>
    </div>
  )
}
