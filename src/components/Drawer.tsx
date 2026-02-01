// Tremor Drawer [v0.0.2]

import * as DrawerPrimitives from "@radix-ui/react-dialog"
import { RiCloseLine } from "@remixicon/react"
import * as React from "react"

import { cx, focusRing } from "@/lib/utils"

import { Button } from "./Button"

const Drawer = (
  props: React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Root>,
) => {
  return <DrawerPrimitives.Root tremor-id="tremor-raw" {...props} />
}
Drawer.displayName = "Drawer"

const DrawerTrigger = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitives.Trigger>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Trigger>
>(({ className, ...props }, ref) => {
  return (
    <DrawerPrimitives.Trigger ref={ref} className={cx(className)} {...props} />
  )
})
DrawerTrigger.displayName = "Drawer.Trigger"

const DrawerClose = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Close>
>(({ className, ...props }, ref) => {
  return (
    <DrawerPrimitives.Close ref={ref} className={cx(className)} {...props} />
  )
})
DrawerClose.displayName = "Drawer.Close"

const DrawerPortal = DrawerPrimitives.Portal

DrawerPortal.displayName = "DrawerPortal"

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitives.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Overlay>
>(({ className, ...props }, forwardedRef) => {
  return (
    <DrawerPrimitives.Overlay
      ref={forwardedRef}
      className={cx(
        // base
        "fixed inset-0 z-50 overflow-y-auto",
        // background color
        "bg-black/30",
        // transition
        "data-[state=closed]:animate-hide data-[state=open]:animate-dialogOverlayShow",
        "drawer-overlay-animated",
        className,
      )}
      {...props}
    />
  )
})

DrawerOverlay.displayName = "DrawerOverlay"

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Content> & {
    side?: "left" | "right"
  }
>(({ className, side = "right", ...props }, forwardedRef) => {
  return (
    <DrawerPortal>
      <DrawerOverlay>
        <DrawerPrimitives.Content
          ref={forwardedRef}
          aria-describedby={undefined}
          className={cx(
            // base
            "fixed inset-y-0 z-50 flex flex-1 flex-col overflow-y-auto bg-white p-4 shadow-lg focus:outline-none dark:bg-[#090E1A] sm:p-6",
            // position
            side === "right" ? "right-0" : "left-0",
            // border
            side === "right" ? "border-l" : "border-r",
            "border-gray-200 dark:border-gray-900",
            // transition
            side === "right"
              ? "data-[state=closed]:animate-drawerSlideRightAndFade data-[state=open]:animate-drawerSlideLeftAndFade"
              : "data-[state=closed]:animate-drawerSlideLeftAndFade data-[state=open]:animate-drawerSlideRightAndFade",
            focusRing,
            className,
          )}
          {...props}
        />
      </DrawerOverlay>
    </DrawerPortal>
  )
})

DrawerContent.displayName = "DrawerContent"

const DrawerHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className="flex items-start justify-between gap-x-4 border-b border-gray-200 pb-4 dark:border-gray-900"
      {...props}
    >
      <div className={cx("mt-1 flex flex-col gap-y-1", className)}>
        {children}
      </div>
      <DrawerPrimitives.Close asChild>
        <Button
          variant="ghost"
          className="aspect-square p-1 hover:bg-gray-100 hover:dark:bg-gray-400/10"
        >
          <RiCloseLine className="size-6" aria-hidden="true" />
        </Button>
      </DrawerPrimitives.Close>
    </div>
  )
})

DrawerHeader.displayName = "Drawer.Header"

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Title>
>(({ className, ...props }, forwardedRef) => (
  <DrawerPrimitives.Title
    ref={forwardedRef}
    className={cx(
      // base
      "text-base font-semibold",
      // text color
      "text-gray-900 dark:text-gray-50",
      className,
    )}
    {...props}
  />
))

DrawerTitle.displayName = "DrawerTitle"

const DrawerBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cx("flex-1 py-4", className)} {...props} />
})
DrawerBody.displayName = "Drawer.Body"

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Description>
>(({ className, ...props }, forwardedRef) => {
  return (
    <DrawerPrimitives.Description
      ref={forwardedRef}
      className={cx("text-gray-500 dark:text-gray-500", className)}
      {...props}
    />
  )
})

DrawerDescription.displayName = "DrawerDescription"

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cx(
        "flex flex-col-reverse border-t border-gray-200 pt-4 sm:flex-row sm:justify-end sm:gap-2 dark:border-gray-900",
        className,
      )}
      {...props}
    />
  )
}

DrawerFooter.displayName = "DrawerFooter"

interface DrawerHeaderTitleProps {
  title: React.ReactNode
  description?: React.ReactNode
}

function DrawerHeaderTitle({ title, description }: DrawerHeaderTitleProps) {
  return (
    <>
      <DrawerTitle>{title}</DrawerTitle>
      {description != null && (
        <DrawerDescription className="text-sm mt-0.5 flex items-center gap-1.5">
          {description}
        </DrawerDescription>
      )}
    </>
  )
}
DrawerHeaderTitle.displayName = "DrawerHeaderTitle"

export {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerTitle,
  DrawerTrigger,
}
