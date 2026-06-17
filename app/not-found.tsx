import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Text */}
        <h1 className="text-6xl md:text-8xl font-bold text-primary mb-4">404</h1>

        {/* Error Message */}
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Page Not Found
        </h2>

        <p className="text-muted-foreground text-base md:text-lg mb-8">
          Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Decorative Line */}
        <div className="w-full h-px bg-border mb-8" />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Go Home
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Contact Us
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">Explore more:</p>
          <nav className="flex flex-col gap-2">
            <Link
              href="/exams/waec"
              className="text-primary hover:underline"
            >
              WAEC Exams
            </Link>
            <Link
              href="/exams/neco"
              className="text-primary hover:underline"
            >
              NECO Exams
            </Link>
            <Link
              href="/exams/nabteb"
              className="text-primary hover:underline"
            >
              NABTEB Exams
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}
