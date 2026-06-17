import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import PinEntryForm from "./pin-entry-form"

export default function PinPage() {
  return (
    <div className="container py-10 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Enter Your PIN</CardTitle>
          <CardDescription className="text-center">
            Enter the PIN you received after payment to access your subject content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PinEntryForm />
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          <p>If you haven't received your PIN, please check your email or contact support.</p>
        </CardFooter>
      </Card>
    </div>
  )
}
