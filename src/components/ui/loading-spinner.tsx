import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: number | string
}

export function LoadingSpinner({
  size = 24,
  className,
  ...props
}: LoadingSpinnerProps) {
  return (
    <Loader2
      size={size}
      className={cn("animate-spin text-theme", className)}
      {...props}
    />
  )
}

export function PageLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-2">
        <LoadingSpinner size={32} />
        <p className="text-sm text-gray-500 animate-pulse">Loading data...</p>
      </div>
    </div>
  )
}
