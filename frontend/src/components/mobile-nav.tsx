"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-blue-950 text-white border-blue-800">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl" onClick={() => setOpen(false)}>
            TF2 Trading Stats
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>
        <nav className="mt-8 flex flex-col gap-4">
          <Link href="/" className="text-lg font-medium" onClick={() => setOpen(false)}>
            Home
          </Link>
          <Link href="#" className="text-lg font-medium text-muted-foreground" onClick={() => setOpen(false)}>
            Market
          </Link>
          <Link href="#" className="text-lg font-medium text-muted-foreground" onClick={() => setOpen(false)}>
            Items
          </Link>
          <Link href="#" className="text-lg font-medium text-muted-foreground" onClick={() => setOpen(false)}>
            Unusual Effects
          </Link>
          <Link href="#" className="text-lg font-medium text-muted-foreground" onClick={() => setOpen(false)}>
            About
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
