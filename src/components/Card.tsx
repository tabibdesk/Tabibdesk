// Tremor Card [v0.0.0]

import React from "react"
import { cx } from "@/lib/utils"

interface CardProps extends React.ComponentPropsWithoutRef<"div"> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, forwardedRef) => (
    <div
      ref={forwardedRef}
      className={cx(
        // base
        "relative w-full rounded-lg border p-6 text-left shadow-sm",
        // border color
        "border-gray-200 dark:border-gray-800",
        // background color
        "bg-white dark:bg-gray-950",
        className,
      )}
      tremor-id="tremor-raw"
      {...props}
    >
      {children}
    </div>
  ),
)

Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, forwardedRef) => (
  <div
    ref={forwardedRef}
    className={cx("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  >
    {children}
  </div>
))

CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"h3">
>(({ className, children, ...props }, forwardedRef) => (
  <h3
    ref={forwardedRef}
    className={cx(
      "text-lg font-semibold text-gray-900 dark:text-gray-50",
      className,
    )}
    {...props}
  >
    {children}
  </h3>
))

CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(({ className, children, ...props }, forwardedRef) => (
  <p
    ref={forwardedRef}
    className={cx("text-sm text-gray-600 dark:text-gray-400", className)}
    {...props}
  >
    {children}
  </p>
))

CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, forwardedRef) => (
  <div ref={forwardedRef} className={cx(className)} {...props}>
    {children}
  </div>
))

CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, forwardedRef) => (
  <div
    ref={forwardedRef}
    className={cx("flex items-center pt-6", className)}
    {...props}
  >
    {children}
  </div>
))

CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }

