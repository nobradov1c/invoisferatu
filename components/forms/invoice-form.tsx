"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
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
      items: [{ description: "", quantity: 1, rate: 0 }],
      taxRate: 0,
      notes: "",
      termsAndConditions: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");
  const watchedTaxRate = watch("taxRate") || 0;

  // Calculate totals
  const subtotal =
    watchedItems?.reduce((sum, item) => {
      return sum + (item?.quantity || 0) * (item?.rate || 0);
    }, 0) || 0;

  const taxAmount = subtotal * (watchedTaxRate / 100);
  const total = subtotal + taxAmount;

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

    // Items validation
    if (!data.items || data.items.length === 0) {
      errors.items = "At least one item is required";
    } else {
      data.items.forEach((item, index) => {
        if (!item.description?.trim()) {
          if (!errors.items) errors.items = [];
          if (!errors.items[index]) errors.items[index] = {};
          errors.items[index].description = "Item description is required";
        }
        if (!item.quantity || item.quantity <= 0) {
          if (!errors.items) errors.items = [];
          if (!errors.items[index]) errors.items[index] = {};
          errors.items[index].quantity = "Quantity must be greater than 0";
        }
        if (!item.rate || item.rate <= 0) {
          if (!errors.items) errors.items = [];
          if (!errors.items[index]) errors.items[index] = {};
          errors.items[index].rate = "Rate must be greater than 0";
        }
      });
    }

    // Tax rate validation
    if (data.taxRate < 0 || data.taxRate > 100) {
      errors.taxRate = "Tax rate must be between 0 and 100";
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
            if (itemErrors.description) {
              setError(`items.${index}.description`, {
                message: itemErrors.description,
              });
            }
            if (itemErrors.quantity) {
              setError(`items.${index}.quantity`, {
                message: itemErrors.quantity,
              });
            }
            if (itemErrors.rate) {
              setError(`items.${index}.rate`, { message: itemErrors.rate });
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

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  <div className="mb-2 grid grid-cols-12 gap-2 font-medium text-muted-foreground text-sm">
                    <div className="col-span-1">#</div>
                    <div className="col-span-5">Description *</div>
                    <div className="col-span-2">Quantity *</div>
                    <div className="col-span-2">Rate *</div>
                    <div className="col-span-1">Amount</div>
                    <div className="col-span-1">Action</div>
                  </div>
                  <Separator className="mb-4" />

                  {fields.map((field, index) => {
                    const quantity = watchedItems?.[index]?.quantity || 0;
                    const rate = watchedItems?.[index]?.rate || 0;
                    const amount = quantity * rate;

                    return (
                      <div
                        key={field.id}
                        className="mb-4 grid grid-cols-12 items-start gap-2"
                      >
                        <div className="col-span-1 pt-2">
                          <Badge variant="outline" className="text-xs">
                            {index + 1}
                          </Badge>
                        </div>

                        <div className="col-span-5 space-y-1">
                          <Textarea
                            placeholder="Item description"
                            rows={2}
                            {...register(`items.${index}.description`)}
                          />
                          {errors.items?.[index]?.description && (
                            <p className="text-destructive text-xs">
                              {errors.items[index]?.description?.message}
                            </p>
                          )}
                        </div>

                        <div className="col-span-2 space-y-1">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="1"
                            {...register(`items.${index}.quantity`, {
                              valueAsNumber: true,
                            })}
                          />
                          {errors.items?.[index]?.quantity && (
                            <p className="text-destructive text-xs">
                              {errors.items[index]?.quantity?.message}
                            </p>
                          )}
                        </div>

                        <div className="col-span-2 space-y-1">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...register(`items.${index}.rate`, {
                              valueAsNumber: true,
                            })}
                          />
                          {errors.items?.[index]?.rate && (
                            <p className="text-destructive text-xs">
                              {errors.items[index]?.rate?.message}
                            </p>
                          )}
                        </div>

                        <div className="col-span-1 pt-2">
                          <Badge variant="secondary">
                            ${amount.toFixed(2)}
                          </Badge>
                        </div>

                        <div className="col-span-1 pt-2">
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({ description: "", quantity: 1, rate: 0 })
                }
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>

              {errors.items && (
                <p className="text-destructive text-sm">
                  {errors.items.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tax & Totals */}
        <Card>
          <CardHeader>
            <CardTitle>Tax & Totals</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="0.00"
                {...register("taxRate", {
                  valueAsNumber: true,
                })}
              />
              {errors.taxRate && (
                <p className="text-destructive text-sm">
                  {errors.taxRate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax:</span>
                <span className="font-medium">${taxAmount.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Thank you for your business!"
                rows={3}
                {...register("notes")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="termsAndConditions">Terms & Conditions</Label>
              <Textarea
                id="termsAndConditions"
                placeholder="All services provided are subject to the terms and conditions outlined in the agreement or engagement letter."
                rows={3}
                {...register("termsAndConditions")}
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
            {isGenerating ? "Generating PDF..." : "Generate Invoice PDF"}
          </Button>
        </div>
      </form>
    </div>
  );
}
