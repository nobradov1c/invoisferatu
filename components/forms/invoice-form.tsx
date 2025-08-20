"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { InvoiceFormData } from "../../app/lib/invoice-schema";
import { generateInvoicePDF } from "../../app/lib/pdf-generator";

export default function InvoiceForm() {
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    mode: "onBlur", // Enable validation on blur for better UX
    defaultValues: {
      naziv: "",
      adresa: "",
      pib: "",
      maticniBroj: "",
      kontaktEmail: "",
      tekuciRacun: "",
      brojFakture: new Date().toISOString().split("T")[0].replace(/-/g, ""),
      datumFakture: new Date().toISOString().split("T")[0],
      clientNaziv: "",
      clientAdresa: "",
      clientPib: "",
      clientMaticniBroj: "",
      items: [{ opis: "", iznos: 0 }],
      napomene: "",
      uslovi: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");

  // Calculate totals
  const total =
    watchedItems?.reduce((sum, item) => {
      return sum + (item?.iznos || 0);
    }, 0) || 0;

  const validateForm = (data: InvoiceFormData) => {
    // biome-ignore lint/suspicious/noExplicitAny: reason
    const errors: any = {};

    // Required field validation
    if (!data.naziv?.trim()) errors.naziv = "Naziv je obavezan";
    if (!data.adresa?.trim()) errors.adresa = "Adresa je obavezna";
    if (!data.pib?.trim()) errors.pib = "PIB je obavezan";
    if (!data.maticniBroj?.trim())
      errors.maticniBroj = "Matični broj je obavezan";
    if (!data.kontaktEmail?.trim()) errors.kontaktEmail = "Email je obavezan";
    if (!data.tekuciRacun?.trim())
      errors.tekuciRacun = "Tekući račun je obavezan";
    if (!data.brojFakture?.trim())
      errors.brojFakture = "Broj fakture je obavezan";
    if (!data.datumFakture?.trim())
      errors.datumFakture = "Datum fakture je obavezan";
    if (!data.clientNaziv?.trim()) errors.clientNaziv = "Naziv je obavezan";
    if (!data.clientAdresa?.trim()) errors.clientAdresa = "Adresa je obavezna";
    if (!data.clientPib?.trim()) errors.clientPib = "PIB je obavezan";
    if (!data.clientMaticniBroj?.trim())
      errors.clientMaticniBroj = "Matični broj je obavezan";

    // Stavke validation
    if (!data.items || data.items.length === 0) {
      errors.items = "Najmanje jedna stavka je potrebna";
    } else {
      data.items.forEach((item, index) => {
        if (!item.opis?.trim()) {
          if (!errors.items) errors.items = [];
          if (!errors.items[index]) errors.items[index] = {};
          errors.items[index].opis = "Opis je obavezan";
        }
        if (!item.iznos || item.iznos <= 0) {
          if (!errors.items) errors.items = [];
          if (!errors.items[index]) errors.items[index] = {};
          errors.items[index].iznos = "Iznos mora biti veći od 0";
        }
      });
    }

    return errors;
  };

  const onSubmit = async (data: InvoiceFormData) => {
    const validationErrors = validateForm(data);
    const hasErrors = Object.keys(validationErrors).length > 0;

    if (hasErrors) {
      // Set errors manually since we're not using schema validation
      Object.keys(validationErrors).forEach((key) => {
        if (key === "items" && Array.isArray(validationErrors.items)) {
          // biome-ignore lint/suspicious/noExplicitAny: reason
          validationErrors.items.forEach((itemErrors: any, index: number) => {
            if (itemErrors.opis) {
              setError(`items.${index}.opis`, {
                message: itemErrors.opis,
              });
            }
            if (itemErrors.iznos) {
              setError(`items.${index}.iznos`, {
                message: itemErrors.iznos,
              });
            }
          });
        } else {
          // biome-ignore lint/suspicious/noExplicitAny: reason
          setError(key as any, { message: validationErrors[key] });
        }
      });
      return;
    }

    setIsGenerating(true);
    try {
      generateInvoicePDF(data);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Podaci o kompaniji
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="naziv">Naziv *</Label>
              <Input
                id="naziv"
                placeholder="Naziv vaše kompanije"
                {...register("naziv")}
              />
              {errors.naziv && (
                <p className="text-destructive text-sm">
                  {errors.naziv.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adresa">Adresa *</Label>
              <Textarea
                id="adresa"
                placeholder="Država, poštanski broj, grad, ulica i broj"
                rows={3}
                {...register("adresa")}
              />
              {errors.adresa && (
                <p className="text-destructive text-sm">
                  {errors.adresa.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pib">PIB *</Label>
              <Input id="pib" placeholder="123456789" {...register("pib")} />
              {errors.pib && (
                <p className="text-destructive text-sm">{errors.pib.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maticniBroj">Matični broj *</Label>
              <Input
                id="maticniBroj"
                placeholder="12345678"
                {...register("maticniBroj")}
              />
              {errors.maticniBroj && (
                <p className="text-destructive text-sm">
                  {errors.maticniBroj.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="kontaktEmail">Kontakt email *</Label>
              <Input
                id="kontaktEmail"
                type="email"
                placeholder="email@kompanija.rs"
                {...register("kontaktEmail")}
              />
              {errors.kontaktEmail && (
                <p className="text-destructive text-sm">
                  {errors.kontaktEmail.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tekuciRacun">Tekući račun *</Label>
              <Input
                id="tekuciRacun"
                placeholder="123-456789-12"
                {...register("tekuciRacun")}
              />
              {errors.tekuciRacun && (
                <p className="text-destructive text-sm">
                  {errors.tekuciRacun.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detalji fakture */}
        <Card>
          <CardHeader>
            <CardTitle>Detalji fakture</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="brojFakture">Broj fakture *</Label>
              <Input
                id="brojFakture"
                placeholder="001/2024"
                {...register("brojFakture")}
              />
              {errors.brojFakture && (
                <p className="text-destructive text-sm">
                  {errors.brojFakture.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="datumFakture">Datum fakture *</Label>
              <Input
                id="datumFakture"
                type="date"
                {...register("datumFakture")}
              />
              {errors.datumFakture && (
                <p className="text-destructive text-sm">
                  {errors.datumFakture.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Račun za</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clientNaziv">Naziv *</Label>
              <Input
                id="clientNaziv"
                placeholder="Naziv klijenta"
                {...register("clientNaziv")}
              />
              {errors.clientNaziv && (
                <p className="text-destructive text-sm">
                  {errors.clientNaziv.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientAdresa">Adresa *</Label>
              <Textarea
                id="clientAdresa"
                placeholder="Država, poštanski broj, grad, ulica i broj"
                rows={3}
                {...register("clientAdresa")}
              />
              {errors.clientAdresa && (
                <p className="text-destructive text-sm">
                  {errors.clientAdresa.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientPib">PIB *</Label>
              <Input
                id="clientPib"
                placeholder="123456789"
                {...register("clientPib")}
              />
              {errors.clientPib && (
                <p className="text-destructive text-sm">
                  {errors.clientPib.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientMaticniBroj">Matični broj *</Label>
              <Input
                id="clientMaticniBroj"
                placeholder="12345678"
                {...register("clientMaticniBroj")}
              />
              {errors.clientMaticniBroj && (
                <p className="text-destructive text-sm">
                  {errors.clientMaticniBroj.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stavke */}
        <Card>
          <CardHeader>
            <CardTitle>Stavke</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-2 font-medium text-muted-foreground text-sm">
                  <div className="col-span-8">Opis *</div>
                  <div className="col-span-3">Iznos (RSD) *</div>
                  <div className="col-span-1">Akcija</div>
                </div>

                <Separator />

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-12 items-start gap-2"
                    >
                      <div className="col-span-8 space-y-2">
                        <Textarea
                          placeholder="Opis stavke"
                          rows={2}
                          {...register(`items.${index}.opis`)}
                        />
                        {errors.items?.[index]?.opis && (
                          <p className="text-destructive text-xs">
                            {errors.items[index]?.opis?.message}
                          </p>
                        )}
                      </div>

                      <div className="col-span-3 space-y-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...register(`items.${index}.iznos`, {
                            valueAsNumber: true,
                          })}
                        />
                        {errors.items?.[index]?.iznos && (
                          <p className="text-destructive text-xs">
                            {errors.items[index]?.iznos?.message}
                          </p>
                        )}
                      </div>

                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => append({ opis: "", iznos: 0 })}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Dodaj stavku
              </Button>

              {errors.items && (
                <p className="text-destructive text-sm">
                  {errors.items.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ukupno */}
        <Card>
          <CardHeader>
            <CardTitle>Ukupno</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between font-semibold text-lg">
              <span>Ukupno:</span>
              <span>{total.toFixed(2)} RSD</span>
            </div>
          </CardContent>
        </Card>

        {/* Dodatne informacije */}
        <Card>
          <CardHeader>
            <CardTitle>Dodatne informacije</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="napomene">Napomene</Label>
              <Textarea
                id="napomene"
                placeholder="Hvala vam na poslovanju!"
                rows={3}
                {...register("napomene")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="uslovi">Uslovi</Label>
              <Textarea
                id="uslovi"
                placeholder="Svi pruženi servisi podležu uslovima navedenim u ugovoru ili sporazumu."
                rows={3}
                {...register("uslovi")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="text-center">
          <Button
            type="submit"
            size="lg"
            disabled={isGenerating}
            className="bg-green-600 hover:bg-green-700"
          >
            {isGenerating ? "Generiše se PDF..." : "Generiši fakturu"}
          </Button>
        </div>
      </form>
    </div>
  );
}
