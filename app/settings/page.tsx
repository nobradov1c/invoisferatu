import { Download, FileText, Layout, Settings, Upload } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="flex items-center gap-2 font-bold text-3xl tracking-tight">
          <Settings className="h-8 w-8" />
          Podešavanja
        </h1>
        <p className="mt-2 text-muted-foreground">
          Upravljajte svojim šablonima i podešavanjima aplikacije
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Templates Management */}
        <Link href="/settings/templates">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layout className="h-5 w-5 text-primary" />
                Šabloni
              </CardTitle>
              <CardDescription>
                Upravljanje šablonima kompanija i klijenata
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 text-muted-foreground text-sm">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>Kreiranje i uređivanje</span>
                </div>
              </div>
              <div className="mt-1 flex items-center gap-4 text-muted-foreground text-sm">
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span>Eksport</span>
                </div>
                <div className="flex items-center gap-1">
                  <Upload className="h-4 w-4" />
                  <span>Import</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-8 text-center text-muted-foreground text-sm">
        <p>Invoisferatu - Invoice Generator</p>
      </div>
    </div>
  );
}
