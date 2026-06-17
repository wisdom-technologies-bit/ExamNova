"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash } from "lucide-react"
import { formatDate } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { deletePost } from "@/app/actions/posts"
import { truncateText } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch("/api/admin/posts")

        if (!response.ok) {
          throw new Error("Failed to fetch posts")
        }

        const data = await response.json()
        setPosts(data)
      } catch (error) {
        console.error("Error fetching posts:", error)
        setError("Failed to load posts. Please check your database connection.")
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load posts. Please check your database connection.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [toast])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
          <Link href="/admin/posts/add">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Post
            </Button>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Manage Posts</CardTitle>
            <CardDescription>View, add, edit, and delete posts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
          <Link href="/admin/posts/add">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Post
            </Button>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>There was a problem loading the posts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
        <Link href="/admin/posts/add">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Post
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Posts</CardTitle>
          <CardDescription>View, add, edit, and delete posts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium">Post</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Content Preview</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Created</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                    <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <tr
                        key={post.id}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-3">
                            {post.image_url ? (
                              <Image
                                src={post.image_url || "/placeholder.svg"}
                                alt={post.title}
                                width={40}
                                height={40}
                                className="rounded object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded bg-muted"></div>
                            )}
                            <span className="font-medium">{post.title}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">{truncateText(post.content.replace(/<[^>]*>?/gm, ""), 50)}</td>
                        <td className="p-4 align-middle">{formatDate(post.created_at)}</td>
                        <td className="p-4 align-middle">
                          {post.is_featured ? (
                            <Badge className="bg-green-600">Featured</Badge>
                          ) : (
                            <Badge variant="outline">Standard</Badge>
                          )}
                        </td>
                        <td className="p-4 align-middle text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/posts/edit/${post.id}`}>
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </Link>
                            <form action={deletePost.bind(null, post.id)}>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 w-8 p-0"
                                type="submit"
                                onClick={(e) => {
                                  if (!confirm("Are you sure you want to delete this post?")) {
                                    e.preventDefault()
                                  }
                                }}
                              >
                                <Trash className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">
                        No posts found
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
