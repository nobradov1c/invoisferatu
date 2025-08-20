import { z } from "zod";

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Item description is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  rate: z.number().min(0.01, "Rate must be greater than 0"),
});

export const invoiceSchema = z.object({
  // Company Information
  companyName: z.string().min(1, "Company name is required"),
  companyAddress: z.string().min(1, "Company address is required"),

  // Invoice Details
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().optional(),
  terms: z.string().optional().default("Due on Receipt"),

  // Client Information
  clientName: z.string().min(1, "Client name is required"),
  clientAddress: z.string().min(1, "Client address is required"),

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
