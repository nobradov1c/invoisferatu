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
