import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getExamCategories } from "@/app/actions/exam-categories"
import { Plus } from "lucide-react"
import CategoryList from "./category-list"

export default async function CategoriesPage() {
  const categories = await getExamCategories()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Exam Categories</h1>
        <Link href="/admin/categories/add">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
          <CardDescription>View, add, and manage exam categories and subcategories.</CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryList initialCategories={categories} />
        </CardContent>
      </Card>
    </div>
  )
}
