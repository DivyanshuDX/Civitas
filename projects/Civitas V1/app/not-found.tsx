import Link from "next/link"
import { Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-6 text-center">
        <div className="flex items-center gap-2 font-bold">
          <Shield className="h-10 w-10 text-primary" />
          <span className="text-2xl">DeCoMan</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">404 - Page Not Found</h1>
        <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col gap-2 min-[400px]:flex-row">
          <Link href="/">
            <Button size="lg">Return Home</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
