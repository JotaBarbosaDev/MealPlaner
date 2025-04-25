import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  indicatorClassName?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, indicatorClassName, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative h-2 w-full overflow-hidden rounded-full bg-gray-200", className)}
        {...props}
      >
        <div 
          className={cn("h-full bg-primary transition-all", indicatorClassName)}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    )
  }
)

Progress.displayName = "Progress"

export { Progress }