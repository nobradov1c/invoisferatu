"use client";

import { Layout, Menu, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface SettingsNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  disabled?: boolean;
}

const settingsNavItems: SettingsNavItem[] = [
  {
    title: "Opšte",
    href: "/settings",
    icon: Settings,
    description: "Osnovna podešavanja aplikacije",
  },
  {
    title: "Šabloni",
    href: "/settings/templates",
    icon: Layout,
    description: "Upravljanje šablonima kompanija i klijenata",
  },
];

export function MobileSettingsNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="mb-6 lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Menu className="mr-2 h-4 w-4" />
            Navigacija kroz podešavanja
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Podešavanja</SheetTitle>
            <SheetDescription>
              Izaberite kategoriju podešavanja
            </SheetDescription>
          </SheetHeader>

          <nav className="mt-6 space-y-2">
            {settingsNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              if (item.disabled) {
                return (
                  <div
                    key={item.href}
                    className={cn(
                      "flex items-start gap-3 rounded-lg p-3 text-sm",
                      "cursor-not-allowed opacity-50",
                    )}
                  >
                    <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div className="grid gap-1">
                      <p className="font-medium text-muted-foreground">
                        {item.title}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-start gap-3 rounded-lg p-3 text-sm transition-colors",
                    "hover:bg-muted/50",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "mt-0.5 h-4 w-4",
                      isActive ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <div className="grid gap-1">
                    <p
                      className={cn(
                        "font-medium",
                        isActive ? "text-foreground" : "text-foreground",
                      )}
                    >
                      {item.title}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-lg border bg-muted/30 p-3">
            <div className="space-y-1 text-muted-foreground text-xs">
              <p className="font-medium">Napomena:</p>
              <p>
                Sva podešavanja se čuvaju lokalno u vašem pretraživaču. Podaci
                se ne šalju na spoljnje servere.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
