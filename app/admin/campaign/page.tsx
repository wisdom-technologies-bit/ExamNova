import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CampaignForm from "./campaign-form"

export const metadata = {
  title: "Campaign | Admin Dashboard",
  description: "Send campaign emails to PIN buyers",
}

export default function CampaignPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Campaign Management</h1>
        <p className="text-muted-foreground mt-2">
          Send targeted emails to all users who have purchased PINs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send Campaign Email</CardTitle>
          <CardDescription>
            Compose and send messages to all PIN buyers (successful and unsuccessful transactions)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
            <CampaignForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
