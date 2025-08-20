"use client";

import { FileText } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-md">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Invoisferatu</h1>
            <p className="text-xs text-muted-foreground">Professional Invoice Generator</p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
