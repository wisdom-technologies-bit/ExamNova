import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ensureAdminExists } from "../actions/setup"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AdminTestPage() {
  // Ensure admin user exists
  const result = await ensureAdminExists()

  return (
    <div className="container py-10 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Admin Account Status</CardTitle>
          <CardDescription>Check if the default admin account exists and get login instructions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 rounded-md">
            <p className="font-medium">Status: {result.success ? "Ready" : "Error"}</p>
            <p className="text-sm mt-1">{result.message || result.error || "Default admin account is ready to use."}</p>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Login Credentials:</p>
            <div className="bg-gray-50 p-3 rounded-md">
              <p>
                <strong>Email:</strong> admin@examnova.com
              </p>
              <p>
                <strong>Password:</strong> admin123
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Use these credentials to log in to the admin dashboard. You should change the password after your first
              login.
            </p>
          </div>

          <div className="flex justify-center mt-4">
            <Link href="/admin-access">
              <Button className="bg-green-600 hover:bg-green-700">Go to Admin Login</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
