"use client";

import { FileText, Menu, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    {
      href: "/",
      label: "Faktura",
      icon: null,
      isActive: pathname === "/",
    },
    {
      href: "/settings",
      label: "Podešavanja",
      icon: Settings,
      isActive: pathname?.startsWith("/settings"),
    },
  ];

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-5">
        {/* Logo */}
        <Link
          href="/"
          className="flex min-w-0 flex-shrink-0 items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <FileText className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-xl">Invoisferatu</h1>
            <p className="text-muted-foreground text-xs">
              Professional Invoice Generator
            </p>
          </div>
          <div className="block sm:hidden">
            <h1 className="font-bold text-lg">Invoisferatu</h1>
          </div>
        </Link>

        {/* Right side - Navigation, mobile menu and Theme toggle */}
        <div className="flex items-center gap-2">
          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-2 md:flex">
            {navigationItems.map((item) => (
              <Button
                key={item.href}
                asChild
                variant={item.isActive ? "default" : "ghost"}
                size="sm"
              >
                <Link href={item.href} className="flex items-center gap-2">
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Mobile Navigation */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-left">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <FileText className="h-5 w-5" />
                    </div>
                    Invoisferatu
                  </SheetTitle>
                </SheetHeader>

                <nav className="mt-8 flex flex-col gap-3">
                  {navigationItems.map((item) => (
                    <Button
                      key={item.href}
                      asChild
                      variant={item.isActive ? "default" : "ghost"}
                      size="lg"
                      className="justify-start"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3"
                      >
                        {item.icon && <item.icon className="h-5 w-5" />}
                        {item.label}
                      </Link>
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
