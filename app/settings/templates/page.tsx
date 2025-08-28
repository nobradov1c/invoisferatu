import { ChevronRight, Layout, Settings } from "lucide-react";
import Link from "next/link";
import { TemplateManager } from "@/components/TemplateManager";

export default function SettingsTemplatesPage() {
  return (
    <div>
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 flex items-center text-muted-foreground text-sm">
        <Link
          href="/settings"
          className="flex items-center gap-1 transition-colors hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
          Podešavanja
        </Link>
        <ChevronRight className="mx-2 h-4 w-4" />
        <span className="flex items-center gap-1 text-foreground">
          <Layout className="h-4 w-4" />
          Šabloni
        </span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="flex items-center gap-2 font-bold text-3xl tracking-tight">
          <Layout className="h-8 w-8" />
          Upravljanje Šablonima
        </h1>
        <p className="mt-2 text-muted-foreground">
          Upravljajte šablonima kompanija i klijenata - eksportujte, importujte
          ili obrišite podatke.
        </p>
      </div>

      {/* Template Manager Component */}
      <TemplateManager />
    </div>
  );
}
