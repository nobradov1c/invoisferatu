"use client";

import {
  AlertTriangle,
  Building,
  CheckCircle2,
  Download,
  FileText,
  Trash2,
  Upload,
  Users,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { useTemplateManager } from "@/app/lib/useTemplateManager";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function TemplateManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const {
    isImporting,
    isExporting,
    isClearing,
    lastImportResult,
    error,
    exportTemplates,
    importTemplates,
    clearTemplates,
    getTemplateStats,
    clearLastImportResult,
  } = useTemplateManager();

  const stats = getTemplateStats();

  const handleExport = () => {
    exportTemplates();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      await importTemplates(file);
      // Reset file input
      event.target.value = "";
    }
  };

  const handleClearConfirm = async () => {
    await clearTemplates();
    setShowClearDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Šabloni Kompanija
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.companyCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Šabloni Klijenata
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.clientCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Ukupno Šablona
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upravljanje Šablonima</CardTitle>
          <CardDescription>
            Eksportujte, importujte ili obrišite sve šablone kompanija i
            klijenata
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Success/Error Messages */}
          {lastImportResult && (
            <Alert
              className={
                lastImportResult.success
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }
            >
              {lastImportResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription
                className={
                  lastImportResult.success ? "text-green-800" : "text-red-800"
                }
              >
                {lastImportResult.message}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-6 px-2 text-xs"
                  onClick={clearLastImportResult}
                >
                  Zatvori
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {error && !lastImportResult && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Export/Import/Clear Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleExport}
              disabled={isExporting || stats.total === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Eksportovanje..." : "Eksportuj Šablone"}
            </Button>

            <Button
              onClick={handleImportClick}
              disabled={isImporting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isImporting ? "Importovanje..." : "Importuj Šablone"}
            </Button>

            <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={isClearing || stats.total === 0}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Obriši Sve Šablone
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Potvrdi Brisanje
                  </DialogTitle>
                  <DialogDescription>
                    Da li ste sigurni da želite da obrišete sve šablone? Ova
                    akcija se ne može poništiti.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="flex gap-2 text-muted-foreground text-sm">
                    <span>Biće obrisano:</span>
                    <Badge variant="outline">
                      {stats.companyCount} kompanija
                    </Badge>
                    <Badge variant="outline">
                      {stats.clientCount} klijenata
                    </Badge>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowClearDialog(false)}
                  >
                    Otkaži
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleClearConfirm}
                    disabled={isClearing}
                  >
                    {isClearing ? "Brisanje..." : "Obriši Sve"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Hidden file input */}
          <Input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Instructions */}
          <div className="space-y-2 border-t pt-4 text-muted-foreground text-sm">
            <p className="font-medium">Instrukcije:</p>
            <ul className="ml-2 list-inside list-disc space-y-1">
              <li>
                <strong>Eksportuj:</strong> Sačuva sve šablone u JSON fajl koji
                možete da sačuvate kao rezervnu kopiju
              </li>
              <li>
                <strong>Importuj:</strong> Učita šablone iz JSON fajla.
                Postojeći šabloni neće biti obrisani
              </li>
              <li>
                <strong>Obriši Sve:</strong> Briše sve sačuvane šablone iz
                lokalnog skladišta
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
