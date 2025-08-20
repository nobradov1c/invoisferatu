import { z } from "zod";

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Item description is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  rate: z.number().min(0.01, "Rate must be greater than 0"),
});

export const invoiceSchema = z.object({
  // Podaci o kompaniji
  naziv: z.string().min(1, "Naziv je obavezan"),
  adresa: z.string().min(1, "Adresa je obavezna"),
  pib: z.string().min(1, "PIB je obavezan"),
  maticniBroj: z.string().min(1, "Matični broj je obavezan"),
  kontaktEmail: z
    .string()
    .email("Nije validan email")
    .min(1, "Email je obavezan"),

  // Invoice Details
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().optional(),
  terms: z.string().optional().default("Due on Receipt"),

  // Račun za
  clientNaziv: z.string().min(1, "Naziv je obavezan"),
  clientAdresa: z.string().min(1, "Adresa je obavezna"),
  clientPib: z.string().min(1, "PIB je obavezan"),
  clientMaticniBroj: z.string().min(1, "Matični broj je obavezan"),

  // Items
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),

  // Tax and totals
  taxRate: z.number().min(0).max(100).optional().default(0),

  // Notes
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
