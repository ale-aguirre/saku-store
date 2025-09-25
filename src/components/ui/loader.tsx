import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoaderProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
}

export function Loader({ size = "md", className, text }: LoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  )
}

interface FullPageLoaderProps {
  text?: string
}

export function FullPageLoader({ text = "Cargando..." }: FullPageLoaderProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card p-6 rounded-lg shadow-lg border">
        <Loader size="lg" text={text} />
      </div>
    </div>
  )
}

interface ButtonLoaderProps {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  className?: string
}

export function ButtonLoader({ isLoading, children, loadingText, className }: ButtonLoaderProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      <span>{isLoading && loadingText ? loadingText : children}</span>
    </div>
  )
}