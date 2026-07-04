import * as React from "react"
import { cn } from "@/lib/utils"

interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const MobileInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center px-3 border-r border-gray-300 bg-gray-50 rounded-l-md">
          <span className="text-gray-500 font-medium text-sm">+91</span>
        </div>
        <input
          type="tel"
          className={cn(
            "flex h-12 w-full rounded-md border bg-white pl-14 pr-3 py-2 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
            error 
              ? "border-red-500 focus-visible:ring-red-500" 
              : "border-gray-300 focus-visible:ring-theme focus-visible:border-theme",
            className
          )}
          ref={ref}
          maxLength={10}
          inputMode="numeric"
          pattern="[0-9]*"
          {...props}
        />
      </div>
    )
  }
)
MobileInput.displayName = "MobileInput"
