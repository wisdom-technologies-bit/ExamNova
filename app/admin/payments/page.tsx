import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getPayments } from "@/app/actions/payments"
import { formatDate } from "@/lib/db"
import { formatNaira } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export default async function PaymentsPage() {
  const payments = await getPayments()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View all payment transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium">Transaction Ref</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">User</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Subject</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Amount</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">PIN</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {payments.length > 0 ? (
                    payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        <td className="p-4 align-middle font-mono text-xs">{payment.transaction_reference}</td>
                        <td className="p-4 align-middle">{payment.user_email}</td>
                        <td className="p-4 align-middle">{payment.subject_title}</td>
                        <td className="p-4 align-middle font-medium">{formatNaira(Number(payment.amount))}</td>
                        <td className="p-4 align-middle font-mono">{payment.pin_code}</td>
                        <td className="p-4 align-middle">{formatDate(payment.created_at)}</td>
                        <td className="p-4 align-middle">
                          <Badge className="bg-green-600">{payment.status}</Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-muted-foreground">
                        No payments found
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
