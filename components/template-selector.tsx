"use client";

import { Check, ChevronDown, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ClientTemplate, CompanyTemplate } from "../app/lib/storage";
import {
  deleteClientTemplate,
  deleteCompanyTemplate,
  getClientTemplates,
  getCompanyTemplates,
  saveClientTemplate,
  saveCompanyTemplate,
} from "../app/lib/storage";

interface TemplateData {
  naziv: string;
  adresa: string;
  pib: string;
  maticniBroj: string;
  kontaktEmail?: string;
  tekuciRacun?: string;
}

interface CompanyTemplateSelectorProps {
  value?: CompanyTemplate | null;
  onSelect: (template: CompanyTemplate | null) => void;
  currentData: TemplateData & { kontaktEmail: string; tekuciRacun: string };
}

interface ClientTemplateSelectorProps {
  value?: ClientTemplate | null;
  onSelect: (template: ClientTemplate | null) => void;
  currentData: {
    clientNaziv: string;
    clientAdresa: string;
    clientPib: string;
    clientMaticniBroj: string;
  };
}

export function CompanyTemplateSelector({
  value,
  onSelect,
  currentData,
}: CompanyTemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [templates, setTemplates] = useState<CompanyTemplate[]>([]);
  const [templateName, setTemplateName] = useState("");

  useEffect(() => {
    setTemplates(getCompanyTemplates());
  }, []);

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;

    try {
      const newTemplate = saveCompanyTemplate({
        name: templateName,
        naziv: currentData.naziv,
        adresa: currentData.adresa,
        pib: currentData.pib,
        maticniBroj: currentData.maticniBroj,
        kontaktEmail: currentData.kontaktEmail,
        tekuciRacun: currentData.tekuciRacun,
      });

      setTemplates(getCompanyTemplates());
      setDialogOpen(false);
      setTemplateName("");
      onSelect(newTemplate);
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  const handleDeleteTemplate = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      deleteCompanyTemplate(templateId);
      setTemplates(getCompanyTemplates());
      if (value?.id === templateId) {
        onSelect(null);
      }
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="flex-1 justify-between"
            >
              {value ? value.name : "Izaberite šablon..."}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            <Command>
              <CommandInput placeholder="Pretražite šablone..." />
              <CommandList>
                <CommandEmpty>Nema pronađenih šablona.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      onSelect(null);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        !value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    Unesite ručno
                  </CommandItem>
                  {templates.map((template) => (
                    <CommandItem
                      key={template.id}
                      onSelect={() => {
                        onSelect(template);
                        setOpen(false);
                      }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value?.id === template.id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-muted-foreground text-sm">
                            {template.naziv}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-50 hover:opacity-100"
                        onClick={(e) => handleDeleteTemplate(template.id, e)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" title="Dodaj šablon">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sačuvaj šablon kompanije</DialogTitle>
              <DialogDescription>
                Sačuvajte trenutne podatke kompanije kao šablon za buduću
                upotrebu.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="templateName">Ime šablona</Label>
                <Input
                  id="templateName"
                  placeholder="Npr. Moja kompanija"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Podaci koji će biti sačuvani:</Label>
                <div className="space-y-1 rounded-md bg-muted p-3 text-muted-foreground text-sm">
                  <p>
                    <strong>Naziv:</strong> {currentData.naziv}
                  </p>
                  <p>
                    <strong>Adresa:</strong> {currentData.adresa}
                  </p>
                  <p>
                    <strong>PIB:</strong> {currentData.pib}
                  </p>
                  <p>
                    <strong>Matični broj:</strong> {currentData.maticniBroj}
                  </p>
                  <p>
                    <strong>Email:</strong> {currentData.kontaktEmail}
                  </p>
                  <p>
                    <strong>Tekući račun:</strong> {currentData.tekuciRacun}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setTemplateName("");
                  }}
                >
                  Otkaži
                </Button>
                <Button
                  onClick={handleSaveTemplate}
                  disabled={!templateName.trim()}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Sačuvaj šablon
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export function ClientTemplateSelector({
  value,
  onSelect,
  currentData,
}: ClientTemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [templates, setTemplates] = useState<ClientTemplate[]>([]);
  const [templateName, setTemplateName] = useState("");

  useEffect(() => {
    setTemplates(getClientTemplates());
  }, []);

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;

    try {
      const newTemplate = saveClientTemplate({
        name: templateName,
        clientNaziv: currentData.clientNaziv,
        clientAdresa: currentData.clientAdresa,
        clientPib: currentData.clientPib,
        clientMaticniBroj: currentData.clientMaticniBroj,
      });

      setTemplates(getClientTemplates());
      setDialogOpen(false);
      setTemplateName("");
      onSelect(newTemplate);
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  const handleDeleteTemplate = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      deleteClientTemplate(templateId);
      setTemplates(getClientTemplates());
      if (value?.id === templateId) {
        onSelect(null);
      }
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="flex-1 justify-between"
            >
              {value ? value.name : "Izaberite šablon..."}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            <Command>
              <CommandInput placeholder="Pretražite šablone..." />
              <CommandList>
                <CommandEmpty>Nema pronađenih šablona.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      onSelect(null);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        !value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    Unesite ručno
                  </CommandItem>
                  {templates.map((template) => (
                    <CommandItem
                      key={template.id}
                      onSelect={() => {
                        onSelect(template);
                        setOpen(false);
                      }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value?.id === template.id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-muted-foreground text-sm">
                            {template.clientNaziv}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-50 hover:opacity-100"
                        onClick={(e) => handleDeleteTemplate(template.id, e)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" title="Dodaj šablon">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sačuvaj šablon klijenta</DialogTitle>
              <DialogDescription>
                Sačuvajte trenutne podatke klijenta kao šablon za buduću
                upotrebu.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientTemplateName">Ime šablona</Label>
                <Input
                  id="clientTemplateName"
                  placeholder="Npr. Glavni klijent"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Podaci koji će biti sačuvani:</Label>
                <div className="space-y-1 rounded-md bg-muted p-3 text-muted-foreground text-sm">
                  <p>
                    <strong>Naziv:</strong> {currentData.clientNaziv}
                  </p>
                  <p>
                    <strong>Adresa:</strong> {currentData.clientAdresa}
                  </p>
                  <p>
                    <strong>PIB:</strong> {currentData.clientPib}
                  </p>
                  <p>
                    <strong>Matični broj:</strong>{" "}
                    {currentData.clientMaticniBroj}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setTemplateName("");
                  }}
                >
                  Otkaži
                </Button>
                <Button
                  onClick={handleSaveTemplate}
                  disabled={!templateName.trim()}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Sačuvaj šablon
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
