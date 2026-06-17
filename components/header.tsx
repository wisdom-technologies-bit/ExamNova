"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-green-600">ExamNova</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-green-600">
            Home
          </Link>
          <Link href="/exams/waec" className="text-sm font-medium transition-colors hover:text-green-600">
            WAEC
          </Link>
          <Link href="/exams/neco" className="text-sm font-medium transition-colors hover:text-green-600">
            NECO
          </Link>
          <Link href="/exams/nabteb" className="text-sm font-medium transition-colors hover:text-green-600">
            NABTEB
          </Link>
          <Link href="/contact" className="text-sm font-medium transition-colors hover:text-green-600">
            Contact
          </Link>
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <Link href="/pin">
            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
              Enter PIN
            </Button>
          </Link>
        </div>
        <button className="flex md:hidden" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md animate-in md:hidden bg-background",
          isMenuOpen ? "slide-in-from-top-0" : "hidden",
        )}
      >
        <div className="flex flex-col space-y-4">
          <Link
            href="/"
            className="text-lg font-medium transition-colors hover:text-green-600"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/exams/waec"
            className="text-lg font-medium transition-colors hover:text-green-600"
            onClick={() => setIsMenuOpen(false)}
          >
            WAEC
          </Link>
          <Link
            href="/exams/neco"
            className="text-lg font-medium transition-colors hover:text-green-600"
            onClick={() => setIsMenuOpen(false)}
          >
            NECO
          </Link>
          <Link
            href="/exams/nabteb"
            className="text-lg font-medium transition-colors hover:text-green-600"
            onClick={() => setIsMenuOpen(false)}
          >
            NABTEB
          </Link>
          <Link
            href="/contact"
            className="text-lg font-medium transition-colors hover:text-green-600"
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>
          <Link
            href="/pin"
            className="text-lg font-medium transition-colors hover:text-green-600"
            onClick={() => setIsMenuOpen(false)}
          >
            Enter PIN
          </Link>
        </div>
      </div>
    </header>
  )
}
