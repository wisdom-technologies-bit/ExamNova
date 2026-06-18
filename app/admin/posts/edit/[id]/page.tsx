"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { ImageUpload } from "@/components/image-upload"
import { updatePost, getPostById } from "@/app/actions/posts"

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }),
  isFeatured: z.boolean().default(false),
  imageUrl: z.string().optional(),
})

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = Number.parseInt(params.id as string)

  if (isNaN(postId)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-4">Invalid post ID</p>
          <Button onClick={() => router.push("/admin/posts")}>Go Back</Button>
        </div>
      </div>
    )
  }
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPost, setIsLoadingPost] = useState(true)
  const [post, setPost] = useState<any>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      isFeatured: false,
      imageUrl: "",
    },
  })

  useEffect(() => {
    async function fetchPost() {
      try {
        const data = await getPostById(postId)

        if (!data) {
          throw new Error("Post not found")
        }

        setPost(data)

        // Set form values
        form.reset({
          title: data.title,
          content: data.content,
          isFeatured: data.is_featured,
          imageUrl: data.image_url || "",
        })
      } catch (error) {
        console.error("[v0] Failed to fetch post:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load post. Please try again.",
        })
      } finally {
        setIsLoadingPost(false)
      }
    }

    fetchPost()
  }, [postId, form, toast])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const result = await updatePost(
        postId,
        values.title,
        values.content,
        values.isFeatured,
        values.imageUrl || undefined,
      )

      if (result.success) {
        toast({
          title: "Post Updated",
          description: "The post has been updated successfully.",
        })

        router.push("/admin/posts")
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Update",
          description: result.error || "Something went wrong. Please try again.",
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

  if (isLoadingPost) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-4">Post not found</p>
          <Button onClick={() => router.push("/admin/posts")}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
        <Button variant="outline" onClick={() => router.push("/admin/posts")}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Post Details</CardTitle>
          <CardDescription>Edit the post information.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Post Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Featured Image</FormLabel>
                    <FormControl>
                      <ImageUpload value={field.value || ""} onChange={field.onChange} className="mt-2" />
                    </FormControl>
                    <FormDescription>Upload an image for this post. This is optional.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter the post content here..." className="min-h-32" {...field} />
                    </FormControl>
                    <FormDescription>
                      You can use HTML tags for formatting. This content will be displayed on the post page.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured Post</FormLabel>
                      <FormDescription>Featured posts will be displayed prominently on the homepage.</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Post"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
