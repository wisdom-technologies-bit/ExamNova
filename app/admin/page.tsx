"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Book, FileText, Mail, BarChart, DollarSign } from "lucide-react"
import { formatNaira } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("recent")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if we're on a mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    // Initial check
    checkMobile()

    // Add resize listener
    window.addEventListener("resize", checkMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/stats")

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard stats")
        }

        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError("Failed to load dashboard data. Please refresh the page.")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  // Handle tab change for both mobile and desktop
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the ExamNova admin dashboard.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.counts.categories}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subcategories</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.counts.subcategories}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.counts.subjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.counts.posts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.counts.messages}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payments</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.counts.payments}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{formatNaira(Number(stats.revenue))}</div>
        </CardContent>
      </Card>

      {/* Mobile view: Use a select dropdown instead of tabs */}
      {isMobile ? (
        <div className="space-y-4">
          <Select value={activeTab} onValueChange={handleTabChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent Activity</SelectItem>
              <SelectItem value="payments">Recent Payments</SelectItem>
              <SelectItem value="messages">Recent Messages</SelectItem>
              <SelectItem value="popular">Popular Subjects</SelectItem>
            </SelectContent>
          </Select>

          {activeTab === "recent" && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Overview of recent payments and messages.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Recent Payments</h4>
                    <div className="space-y-2">
                      {stats.recentPayments.map((payment: any) => (
                        <div key={payment.id} className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{payment.subject_title}</p>
                            <p className="text-sm text-muted-foreground">{payment.user_email}</p>
                          </div>
                          <div className="text-sm font-medium">{formatNaira(Number(payment.amount))}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Recent Messages</h4>
                    <div className="space-y-2">
                      {stats.recentMessages.map((message: any) => (
                        <div key={message.id} className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{message.full_name}</p>
                            <p className="text-sm text-muted-foreground">{message.email}</p>
                          </div>
                          <div className="text-sm">
                            {message.is_replied ? (
                              <span className="text-green-600">Replied</span>
                            ) : (
                              <span className="text-amber-600">Pending</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "payments" && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Recent payment transactions.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentPayments.map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between border-b pb-4">
                      <div className="space-y-1">
                        <p className="font-medium">{payment.subject_title}</p>
                        <p className="text-sm text-muted-foreground">{payment.user_email}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.created_at).toLocaleString("en-NG")}
                        </p>
                      </div>
                      <div className="text-lg font-medium text-green-600">{formatNaira(Number(payment.amount))}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "messages" && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription>Recent contact form submissions.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentMessages.map((message: any) => (
                    <div key={message.id} className="flex items-center justify-between border-b pb-4">
                      <div className="space-y-1">
                        <p className="font-medium">{message.full_name}</p>
                        <p className="text-sm text-muted-foreground">{message.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleString("en-NG")}
                        </p>
                      </div>
                      <div>
                        {message.is_replied ? (
                          <Badge className="bg-green-600">Replied</Badge>
                        ) : (
                          <Badge className="bg-amber-600">Pending</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "popular" && (
            <Card>
              <CardHeader>
                <CardTitle>Popular Subjects</CardTitle>
                <CardDescription>Most purchased subjects.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.popularSubjects.map((subject: any) => (
                    <div key={subject.id} className="flex items-center justify-between border-b pb-4">
                      <div className="space-y-1">
                        <p className="font-medium">{subject.title}</p>
                      </div>
                      <div className="text-lg font-medium">
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {subject.purchase_count} purchases
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* Desktop view: Use tabs with scrollable list */
        <Tabs defaultValue="recent" value={activeTab} onValueChange={handleTabChange}>
          <div className="overflow-x-auto pb-2">
            <TabsList className="w-full sm:w-auto inline-flex">
              <TabsTrigger value="recent">Recent Activity</TabsTrigger>
              <TabsTrigger value="payments">Recent Payments</TabsTrigger>
              <TabsTrigger value="messages">Recent Messages</TabsTrigger>
              <TabsTrigger value="popular">Popular Subjects</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Overview of recent payments and messages.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Recent Payments</h4>
                    <div className="space-y-2">
                      {stats.recentPayments.map((payment: any) => (
                        <div key={payment.id} className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{payment.subject_title}</p>
                            <p className="text-sm text-muted-foreground">{payment.user_email}</p>
                          </div>
                          <div className="text-sm font-medium">{formatNaira(Number(payment.amount))}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Recent Messages</h4>
                    <div className="space-y-2">
                      {stats.recentMessages.map((message: any) => (
                        <div key={message.id} className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{message.full_name}</p>
                            <p className="text-sm text-muted-foreground">{message.email}</p>
                          </div>
                          <div className="text-sm">
                            {message.is_replied ? (
                              <span className="text-green-600">Replied</span>
                            ) : (
                              <span className="text-amber-600">Pending</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Recent payment transactions.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentPayments.map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between border-b pb-4">
                      <div className="space-y-1">
                        <p className="font-medium">{payment.subject_title}</p>
                        <p className="text-sm text-muted-foreground">{payment.user_email}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.created_at).toLocaleString("en-NG")}
                        </p>
                      </div>
                      <div className="text-lg font-medium text-green-600">{formatNaira(Number(payment.amount))}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription>Recent contact form submissions.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentMessages.map((message: any) => (
                    <div key={message.id} className="flex items-center justify-between border-b pb-4">
                      <div className="space-y-1">
                        <p className="font-medium">{message.full_name}</p>
                        <p className="text-sm text-muted-foreground">{message.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleString("en-NG")}
                        </p>
                      </div>
                      <div>
                        {message.is_replied ? (
                          <Badge className="bg-green-600">Replied</Badge>
                        ) : (
                          <Badge className="bg-amber-600">Pending</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="popular" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Popular Subjects</CardTitle>
                <CardDescription>Most purchased subjects.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.popularSubjects.map((subject: any) => (
                    <div key={subject.id} className="flex items-center justify-between border-b pb-4">
                      <div className="space-y-1">
                        <p className="font-medium">{subject.title}</p>
                      </div>
                      <div className="text-lg font-medium">
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {subject.purchase_count} purchases
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}
