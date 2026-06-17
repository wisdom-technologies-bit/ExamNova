"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { ImageUpload } from "@/components/image-upload"
import { createSubject } from "@/app/actions/subjects"
import { useEffect } from "react"

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  price: z.coerce.number().min(1, { message: "Price must be at least 1" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }),
  subcategoryId: z.coerce.number().min(1, { message: "Please select a subcategory" }),
  isFeatured: z.boolean().default(false),
  imageUrl: z.string().optional(),
})

export default function AddSubjectPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [subcategories, setSubcategories] = useState<any[]>([])

  useEffect(() => {
    async function fetchSubcategories() {
      try {
        const response = await fetch("/api/subcategories")
        const data = await response.json()
        setSubcategories(data)
      } catch (error) {
        console.error("Failed to fetch subcategories:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load subcategories. Please try again.",
        })
      }
    }

    fetchSubcategories()
  }, [toast])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      price: 0,
      content: "",
      subcategoryId: 0,
      isFeatured: false,
      imageUrl: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const result = await createSubject(
        values.title,
        values.price,
        values.content,
        values.subcategoryId,
        values.isFeatured,
        values.imageUrl || undefined,
      )

      if (result.success) {
        toast({
          title: "Subject Created",
          description: "The subject has been created successfully.",
        })

        router.push("/admin/subjects")
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Create",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Add Subject</h1>
        <Button variant="outline" onClick={() => router.push("/admin/subjects")}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subject Details</CardTitle>
          <CardDescription>Add a new subject to the platform.</CardDescription>
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
                      <Input placeholder="Mathematics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (NGN)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subcategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subcategory" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subcategories.map((subcategory) => (
                          <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                            {subcategory.name} ({subcategory.category_name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <ImageUpload value={field.value || ""} onChange={field.onChange} className="mt-2" />
                    </FormControl>
                    <FormDescription>Upload an image for this subject. This is optional.</FormDescription>
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
                      <Textarea placeholder="Enter the subject content here..." className="min-h-32" {...field} />
                    </FormControl>
                    <FormDescription>
                      You can use HTML tags for formatting. This content will be displayed to users who have purchased
                      access.
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
                      <FormLabel>Featured Subject</FormLabel>
                      <FormDescription>
                        Featured subjects will be displayed prominently on the homepage.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Subject"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
