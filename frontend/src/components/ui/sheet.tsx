import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: "top" | "bottom" | "left" | "right"
  }
>(({ className, side = "right", ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 flex flex-col bg-white dark:bg-blue-950 p-6 shadow-lg transition-all",
        side === "right" && "top-0 right-0 h-full w-80 border-l border-blue-800",
        side === "left" && "top-0 left-0 h-full w-80 border-r border-blue-800",
        side === "top" && "top-0 left-0 w-full h-1/3 border-b border-blue-800",
        side === "bottom" && "bottom-0 left-0 w-full h-1/3 border-t border-blue-800",
        className
      )}
      {...props}
    />
  </DialogPrimitive.Portal>
))
SheetContent.displayName = "SheetContent"

export { Sheet, SheetTrigger, SheetContent } 