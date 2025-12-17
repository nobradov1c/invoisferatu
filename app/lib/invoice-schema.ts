import { z } from "zod";

export const invoiceItemSchema = z.object({
  opis: z.string().min(1, "Opis je obavezan"),
  iznos: z.number().min(0.01, "Iznos mora biti veći od 0"),
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
  tekuciRacun: z.string().min(1, "Tekući račun je obavezan"),

  // Detalji fakture
  brojFakture: z.string().min(1, "Broj fakture je obavezan"),
  datumFakture: z.string().min(1, "Datum fakture je obavezan"),

  // Račun za
  clientNaziv: z.string().min(1, "Naziv je obavezan"),
  clientAdresa: z.string().min(1, "Adresa je obavezna"),
  clientPib: z.string().min(1, "PIB je obavezan"),
  clientMaticniBroj: z.string().min(1, "Matični broj je obavezan"),

  // Stavke
  items: z.array(invoiceItemSchema).min(1, "Najmanje jedna stavka je potrebna"),

  // Dodatne informacije
  bottomNote: z.string().optional(),
  sifraPlacanja: z.string().min(1, "Šifra plaćanja je obavezna").default("221"),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
