import * as React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  action?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  action,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-4 md:flex-row md:items-center md:justify-between",
        className
      )}
      {...props}
    >
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h2>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  )
}
