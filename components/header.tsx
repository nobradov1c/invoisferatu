"use client";

import { FileText, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 w-full items-center justify-between px-5">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-xl">Invoisferatu</h1>
              <p className="text-muted-foreground text-xs">
                Professional Invoice Generator
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            <Button
              asChild
              variant={pathname === "/" ? "default" : "ghost"}
              size="sm"
            >
              <Link href="/">Faktura</Link>
            </Button>

            <Button
              asChild
              variant={pathname?.startsWith("/settings") ? "default" : "ghost"}
              size="sm"
            >
              <Link href="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Podešavanja
              </Link>
            </Button>
          </nav>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
