"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { fixAdminPassword } from "./actions"

export default function AdminPasswordFixPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  async function handleFixPassword() {
    setIsLoading(true)
    try {
      const response = await fixAdminPassword()
      setResult(response)

      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
          duration: 5000,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message,
          duration: 5000,
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: "An unexpected error occurred",
      })
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
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
          <CardTitle>Admin Password Fix</CardTitle>
          <CardDescription>
            This utility will fix the admin password by properly hashing the temporary password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>This tool will:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Read the plaintext password from the temporary column</li>
            <li>Hash it properly using bcrypt</li>
            <li>Update the password_hash column</li>
            <li>Remove the temporary column</li>
          </ol>

          {result && (
            <div
              className={`p-4 rounded-md ${result.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
            >
              {result.message}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleFixPassword} className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
            {isLoading ? "Processing..." : "Fix Admin Password"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
