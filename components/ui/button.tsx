import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-indigo-600 text-white shadow hover:bg-indigo-500": variant === "default",
            "bg-gray-800 text-gray-100 hover:bg-gray-700": variant === "secondary",
            "hover:bg-gray-800 hover:text-gray-100": variant === "ghost",
            "h-9 px-4": size === "default",
            "h-8 px-3 text-sm": size === "sm",
            "h-10 px-8": size === "lg",
            "h-9 w-9 p-0": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)