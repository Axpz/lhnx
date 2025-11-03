import * as React from "react"

import { cn } from "@/lib/utils"

// 水晶卡片样式常量 - 统一管理，易于维护
const GLASS_CARD_STYLES = {
  base: "relative overflow-hidden rounded-2xl",
  glass: "bg-white/10 backdrop-blur-3xl",
  border: "border border-white/20 ring-1 ring-white/10",
  shadow: "shadow-[0_8px_32px_rgba(0,0,0,0.1)]",
  highlight: "before:absolute before:inset-0 before:rounded-2xl before:bg-linear-to-br before:from-white/40 before:via-white/5 before:to-transparent before:opacity-50 before:pointer-events-none",
  facet: "after:absolute after:inset-0 after:rounded-2xl after:bg-[conic-gradient(from_45deg,rgba(255,255,255,0.3),transparent_50%,rgba(255,255,255,0.3))] after:opacity-20 after:mix-blend-overlay after:pointer-events-none",
  hover: "transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.15)] hover:border-white/30",
  dark: "dark:bg-slate-900/30 dark:border-white/10",
} as const;

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      Object.values(GLASS_CARD_STYLES).join(' '),
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6 relative z-10", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 relative z-10", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 relative z-10", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
