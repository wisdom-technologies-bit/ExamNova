"use client"

import Link from "next/link"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Plus, Trash } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { deleteExamCategory, deleteExamSubcategory, getSubcategoriesByCategory } from "@/app/actions/exam-categories"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createExamSubcategory } from "@/app/actions/exam-categories"

export default function CategoryList({ initialCategories }: { initialCategories: any[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [subcategories, setSubcategories] = useState<Record<number, any[]>>({})
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const [newSubcategoryName, setNewSubcategoryName] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const { toast } = useToast()

  const handleAccordionChange = async (categoryId: number) => {
    if (!subcategories[categoryId]) {
      try {
        const fetchedSubcategories = await getSubcategoriesByCategory(categoryId)
        setSubcategories((prev) => ({
          ...prev,
          [categoryId]: fetchedSubcategories,
        }))
      } catch (error) {
        console.error(`Failed to fetch subcategories for category ${categoryId}:`, error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load subcategories. Please try again.",
        })
      }
    }
  }

  const handleDeleteCategory = async (categoryId: number) => {
    if (
      confirm(
        "Are you sure you want to delete this category? This will also delete all subcategories and subjects within it.",
      )
    ) {
      setIsLoading((prev) => ({ ...prev, [`category-${categoryId}`]: true }))

      try {
        const result = await deleteExamCategory(categoryId)

        if (result.success) {
          setCategories((prev) => prev.filter((category) => category.id !== categoryId))
          toast({
            title: "Category Deleted",
            description: "The category has been deleted successfully.",
          })
        } else {
          toast({
            variant: "destructive",
            title: "Failed to Delete",
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
        setIsLoading((prev) => ({ ...prev, [`category-${categoryId}`]: false }))
      }
    }
  }

  const handleDeleteSubcategory = async (subcategoryId: number, categoryId: number) => {
    if (confirm("Are you sure you want to delete this subcategory? This will also delete all subjects within it.")) {
      setIsLoading((prev) => ({ ...prev, [`subcategory-${subcategoryId}`]: true }))

      try {
        const result = await deleteExamSubcategory(subcategoryId)

        if (result.success) {
          setSubcategories((prev) => ({
            ...prev,
            [categoryId]: prev[categoryId].filter((subcategory) => subcategory.id !== subcategoryId),
          }))
          toast({
            title: "Subcategory Deleted",
            description: "The subcategory has been deleted successfully.",
          })
        } else {
          toast({
            variant: "destructive",
            title: "Failed to Delete",
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
        setIsLoading((prev) => ({ ...prev, [`subcategory-${subcategoryId}`]: false }))
      }
    }
  }

  const handleAddSubcategory = async () => {
    if (!selectedCategoryId || !newSubcategoryName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a subcategory name",
      })
      return
    }

    setIsLoading((prev) => ({ ...prev, "add-subcategory": true }))

    try {
      console.log("Creating subcategory:", newSubcategoryName, "for category:", selectedCategoryId)
      const result = await createExamSubcategory(newSubcategoryName, selectedCategoryId)

      if (result.success) {
        // Update the local state with the new subcategory
        setSubcategories((prev) => ({
          ...prev,
          [selectedCategoryId]: [...(prev[selectedCategoryId] || []), result.subcategory],
        }))

        // Reset form
        setNewSubcategoryName("")

        // Close dialog by setting selectedCategoryId to null
        setSelectedCategoryId(null)

        toast({
          title: "Subcategory Added",
          description: "The subcategory has been added successfully.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Add",
          description: result.error || "Something went wrong. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error adding subcategory:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, "add-subcategory": false }))
    }
  }

  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="w-full">
        {categories.map((category) => (
          <AccordionItem key={category.id} value={category.id.toString()}>
            <AccordionTrigger onClick={() => handleAccordionChange(category.id)} className="hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <span>{category.name}</span>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Dialog open={!!selectedCategoryId} onOpenChange={(open) => !open && setSelectedCategoryId(null)}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-green-600 border-green-600 hover:bg-green-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedCategoryId(category.id)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Subcategory
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Subcategory</DialogTitle>
                        <DialogDescription>
                          Add a new subcategory to{" "}
                          {categories.find((c) => c.id === selectedCategoryId)?.name || "this category"}.
                        </DialogDescription>
                      </DialogHeader>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          handleAddSubcategory()
                        }}
                      >
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="subcategory-name">Subcategory Name</Label>
                            <Input
                              id="subcategory-name"
                              placeholder="e.g., Science"
                              value={newSubcategoryName}
                              onChange={(e) => setNewSubcategoryName(e.target.value)}
                              autoFocus
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={isLoading["add-subcategory"] || !newSubcategoryName.trim()}
                          >
                            {isLoading["add-subcategory"] ? "Adding..." : "Add Subcategory"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8"
                    disabled={isLoading[`category-${category.id}`]}
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-4 space-y-2">
                {subcategories[category.id]?.length > 0 ? (
                  subcategories[category.id].map((subcategory) => (
                    <div
                      key={subcategory.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100"
                    >
                      <span>{subcategory.name}</span>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8"
                        disabled={isLoading[`subcategory-${subcategory.id}`]}
                        onClick={() => handleDeleteSubcategory(subcategory.id, category.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm py-2">No subcategories found</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {categories.length === 0 && (
        <div className="text-center py-6">
          <p className="text-muted-foreground">No categories found</p>
          <Link href="/admin/categories/add">
            <Button className="mt-4 bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
