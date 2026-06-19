"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { BarChart, Book, FileText, Home, Mail, Package, LogOut, Menu, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { logoutAdmin } from "@/app/actions/admin"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/admin",
      active: pathname === "/admin",
    },
    {
      label: "Categories",
      icon: Package,
      href: "/admin/categories",
      active: pathname === "/admin/categories",
    },
    {
      label: "Subjects",
      icon: Book,
      href: "/admin/subjects",
      active: pathname === "/admin/subjects",
    },
    {
      label: "Posts",
      icon: FileText,
      href: "/admin/posts",
      active: pathname === "/admin/posts",
    },
    {
      label: "Contact Messages",
      icon: Mail,
      href: "/admin/contact",
      active: pathname === "/admin/contact",
    },
    {
      label: "Payments",
      icon: BarChart,
      href: "/admin/payments",
      active: pathname === "/admin/payments",
    },
    {
      label: "Campaign",
      icon: Send,
      href: "/admin/campaign",
      active: pathname === "/admin/campaign",
    },
  ]

  const SidebarContent = () => (
    <>
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <span className="text-xl font-bold text-green-600">ExamNova</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                route.active
                  ? "bg-green-100 text-green-700"
                  : "text-muted-foreground hover:bg-green-100 hover:text-green-700",
              )}
              onClick={() => setOpen(false)}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <form action={logoutAdmin}>
          <Button
            type="submit"
            variant="outline"
            className="w-full justify-start text-muted-foreground hover:bg-green-100 hover:text-green-700"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </form>
      </div>
    </>
  )

  // For mobile: show a button that opens a sheet with the sidebar content
  return (
    <>
      {/* Mobile sidebar */}
      <div className="fixed top-0 left-0 z-50 flex h-14 w-full items-center border-b bg-background px-4 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[240px]">
            <div className="flex h-full w-full flex-col border-r bg-green-50">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <span className="text-xl font-bold text-green-600">ExamNova</span>
        </Link>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex h-full w-full flex-col border-r bg-green-50">
        <SidebarContent />
      </div>
    </>
  )
}
