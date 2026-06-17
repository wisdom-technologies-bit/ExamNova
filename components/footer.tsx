import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-green-600">ExamNova</h3>
            <p className="text-sm text-muted-foreground">Access WAEC, NECO & NABTEB exam Expo instantly.</p>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium">Exam Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/exams/waec" className="text-sm text-muted-foreground hover:text-green-600">
                  WAEC
                </Link>
              </li>
              <li>
                <Link href="/exams/neco" className="text-sm text-muted-foreground hover:text-green-600">
                  NECO
                </Link>
              </li>
              <li>
                <Link href="/exams/nabteb" className="text-sm text-muted-foreground hover:text-green-600">
                  NABTEB
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/pin" className="text-sm text-muted-foreground hover:text-green-600">
                  Enter PIN
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-green-600">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium">Contact</h4>
            <p className="text-sm text-muted-foreground">Have questions? Reach out to us.</p>
            <Link href="/contact" className="inline-block text-sm text-green-600 hover:underline">
              Send a message
            </Link>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ExamNova. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
