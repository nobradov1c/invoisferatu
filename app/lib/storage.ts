export interface CompanyTemplate {
  id: string;
  name: string;
  naziv: string;
  adresa: string;
  pib: string;
  maticniBroj: string;
  kontaktEmail: string;
  tekuciRacun: string;
  createdAt: Date;
}

export interface ClientTemplate {
  id: string;
  name: string;
  clientNaziv: string;
  clientAdresa: string;
  clientPib: string;
  clientMaticniBroj: string;
  createdAt: Date;
}

const COMPANY_TEMPLATES_KEY = "invoice-company-templates";
const CLIENT_TEMPLATES_KEY = "invoice-client-templates";

// Company Templates
export function getCompanyTemplates(): CompanyTemplate[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(COMPANY_TEMPLATES_KEY);
    if (!stored) return [];

    const templates = JSON.parse(stored);
    // Convert date strings back to Date objects
    return templates.map(
      (template: CompanyTemplate & { createdAt: string }) => ({
        ...template,
        createdAt: new Date(template.createdAt),
      }),
    );
  } catch (error) {
    console.error("Error loading company templates:", error);
    return [];
  }
}

export function saveCompanyTemplate(
  template: Omit<CompanyTemplate, "id" | "createdAt">,
): CompanyTemplate {
  const newTemplate: CompanyTemplate = {
    ...template,
    id: crypto.randomUUID(),
    createdAt: new Date(),
  };

  const templates = getCompanyTemplates();
  templates.push(newTemplate);

  try {
    localStorage.setItem(COMPANY_TEMPLATES_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error("Error saving company template:", error);
    throw new Error("Greška pri čuvanju šablona kompanije");
  }

  return newTemplate;
}

export function deleteCompanyTemplate(id: string): void {
  const templates = getCompanyTemplates().filter(
    (template) => template.id !== id,
  );

  try {
    localStorage.setItem(COMPANY_TEMPLATES_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error("Error deleting company template:", error);
    throw new Error("Greška pri brisanju šablona kompanije");
  }
}

export function updateCompanyTemplate(
  id: string,
  updates: Partial<Omit<CompanyTemplate, "id" | "createdAt">>,
): CompanyTemplate | null {
  const templates = getCompanyTemplates();
  const templateIndex = templates.findIndex((template) => template.id === id);

  if (templateIndex === -1) return null;

  templates[templateIndex] = {
    ...templates[templateIndex],
    ...updates,
  };

  try {
    localStorage.setItem(COMPANY_TEMPLATES_KEY, JSON.stringify(templates));
    return templates[templateIndex];
  } catch (error) {
    console.error("Error updating company template:", error);
    throw new Error("Greška pri ažuriranju šablona kompanije");
  }
}

// Client Templates
export function getClientTemplates(): ClientTemplate[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(CLIENT_TEMPLATES_KEY);
    if (!stored) return [];

    const templates = JSON.parse(stored);
    // Convert date strings back to Date objects
    return templates.map(
      (template: ClientTemplate & { createdAt: string }) => ({
        ...template,
        createdAt: new Date(template.createdAt),
      }),
    );
  } catch (error) {
    console.error("Error loading client templates:", error);
    return [];
  }
}

export function saveClientTemplate(
  template: Omit<ClientTemplate, "id" | "createdAt">,
): ClientTemplate {
  const newTemplate: ClientTemplate = {
    ...template,
    id: crypto.randomUUID(),
    createdAt: new Date(),
  };

  const templates = getClientTemplates();
  templates.push(newTemplate);

  try {
    localStorage.setItem(CLIENT_TEMPLATES_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error("Error saving client template:", error);
    throw new Error("Greška pri čuvanju šablona klijenta");
  }

  return newTemplate;
}

export function deleteClientTemplate(id: string): void {
  const templates = getClientTemplates().filter(
    (template) => template.id !== id,
  );

  try {
    localStorage.setItem(CLIENT_TEMPLATES_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error("Error deleting client template:", error);
    throw new Error("Greška pri brisanju šablona klijenta");
  }
}

export function updateClientTemplate(
  id: string,
  updates: Partial<Omit<ClientTemplate, "id" | "createdAt">>,
): ClientTemplate | null {
  const templates = getClientTemplates();
  const templateIndex = templates.findIndex((template) => template.id === id);

  if (templateIndex === -1) return null;

  templates[templateIndex] = {
    ...templates[templateIndex],
    ...updates,
  };

  try {
    localStorage.setItem(CLIENT_TEMPLATES_KEY, JSON.stringify(templates));
    return templates[templateIndex];
  } catch (error) {
    console.error("Error updating client template:", error);
    throw new Error("Greška pri ažuriranju šablona klijenta");
  }
}

// Export/Import functionality
export interface TemplateExportData {
  companyTemplates: CompanyTemplate[];
  clientTemplates: ClientTemplate[];
  exportedAt: Date;
  version: string;
}

export function exportTemplatesToFile(): void {
  const companyTemplates = getCompanyTemplates();
  const clientTemplates = getClientTemplates();

  const exportData: TemplateExportData = {
    companyTemplates,
    clientTemplates,
    exportedAt: new Date(),
    version: "1.0",
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

  const exportFileDefaultName = `invoice-templates-${new Date().toISOString().split("T")[0]}.json`;

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
}

export function importTemplatesFromFile(file: File): Promise<{
  success: boolean;
  message: string;
  importedCompanyCount?: number;
  importedClientCount?: number;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importData = JSON.parse(content) as TemplateExportData;

        // Validate the imported data structure
        if (!importData.companyTemplates || !importData.clientTemplates) {
          resolve({
            success: false,
            message:
              "Neispravna struktura fajla. Molimo koristite validni export fajl.",
          });
          return;
        }

        // Validate company templates structure
        const validCompanyTemplates = importData.companyTemplates.filter(
          (template) =>
            template.id &&
            template.name &&
            template.naziv &&
            template.adresa &&
            template.pib &&
            template.maticniBroj &&
            template.kontaktEmail &&
            template.tekuciRacun,
        );

        // Validate client templates structure
        const validClientTemplates = importData.clientTemplates.filter(
          (template) =>
            template.id &&
            template.name &&
            template.clientNaziv &&
            template.clientAdresa &&
            template.clientPib &&
            template.clientMaticniBroj,
        );

        // Get existing templates
        const existingCompanyTemplates = getCompanyTemplates();
        const existingClientTemplates = getClientTemplates();

        // Merge templates, avoiding duplicates by name
        const mergedCompanyTemplates = [...existingCompanyTemplates];
        const mergedClientTemplates = [...existingClientTemplates];

        let importedCompanyCount = 0;
        let importedClientCount = 0;

        // Add company templates that don't already exist
        validCompanyTemplates.forEach((importTemplate) => {
          const exists = existingCompanyTemplates.some(
            (existing) =>
              existing.name === importTemplate.name ||
              existing.id === importTemplate.id,
          );

          if (!exists) {
            const newTemplate: CompanyTemplate = {
              ...importTemplate,
              id: crypto.randomUUID(), // Generate new ID to avoid conflicts
              createdAt: new Date(importTemplate.createdAt),
            };
            mergedCompanyTemplates.push(newTemplate);
            importedCompanyCount++;
          }
        });

        // Add client templates that don't already exist
        validClientTemplates.forEach((importTemplate) => {
          const exists = existingClientTemplates.some(
            (existing) =>
              existing.name === importTemplate.name ||
              existing.id === importTemplate.id,
          );

          if (!exists) {
            const newTemplate: ClientTemplate = {
              ...importTemplate,
              id: crypto.randomUUID(), // Generate new ID to avoid conflicts
              createdAt: new Date(importTemplate.createdAt),
            };
            mergedClientTemplates.push(newTemplate);
            importedClientCount++;
          }
        });

        // Save merged templates
        try {
          localStorage.setItem(
            COMPANY_TEMPLATES_KEY,
            JSON.stringify(mergedCompanyTemplates),
          );
          localStorage.setItem(
            CLIENT_TEMPLATES_KEY,
            JSON.stringify(mergedClientTemplates),
          );

          resolve({
            success: true,
            message: `Uspešno uvezeno ${importedCompanyCount} šablona kompanija i ${importedClientCount} šablona klijenata.`,
            importedCompanyCount,
            importedClientCount,
          });
        } catch (error) {
          console.error("Error saving imported templates:", error);
          resolve({
            success: false,
            message: "Greška pri čuvanju uvezenih šablona.",
          });
        }
      } catch (error) {
        console.error("Error parsing import file:", error);
        resolve({
          success: false,
          message:
            "Greška pri čitanju fajla. Molimo proverite da li je fajl ispravan JSON format.",
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        message: "Greška pri čitanju fajla.",
      });
    };

    reader.readAsText(file);
  });
}

export function clearAllTemplates(): void {
  try {
    localStorage.removeItem(COMPANY_TEMPLATES_KEY);
    localStorage.removeItem(CLIENT_TEMPLATES_KEY);
  } catch (error) {
    console.error("Error clearing templates:", error);
    throw new Error("Greška pri brisanju svih šablona");
  }
}
