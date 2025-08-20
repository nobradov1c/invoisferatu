"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { generateInvoicePDF } from "../../app/lib/pdf-generator";

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

interface InvoiceFormData {
  companyName: string;
  companyAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  terms: string;
  clientName: string;
  clientAddress: string;
  items: InvoiceItem[];
  taxRate: number;
  notes?: string;
  termsAndConditions?: string;
}

export default function InvoiceForm() {
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    defaultValues: {
      companyName: "",
      companyAddress: "",
      invoiceNumber: `INV-${String(Date.now()).slice(-6)}`,
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      terms: "Due on Receipt",
      clientName: "",
      clientAddress: "",
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

  const onSubmit = async (data: InvoiceFormData) => {
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
              Company Information
              <Badge variant="secondary">From</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                placeholder="Your Company Name"
                {...register("companyName")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyAddress">Company Address *</Label>
              <Textarea
                id="companyAddress"
                placeholder="Street Address&#10;City, State ZIP&#10;Country"
                rows={3}
                {...register("companyAddress")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number *</Label>
              <Input
                id="invoiceNumber"
                placeholder="INV-000001"
                {...register("invoiceNumber")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceDate">Invoice Date *</Label>
              <Input
                id="invoiceDate"
                type="date"
                {...register("invoiceDate")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="terms">Terms</Label>
              <Input
                id="terms"
                placeholder="Due on Receipt"
                {...register("terms")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Bill To
              <Badge variant="secondary">Client</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                placeholder="Client Name"
                {...register("clientName")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientAddress">Client Address *</Label>
              <Textarea
                id="clientAddress"
                placeholder="Street Address&#10;City, State ZIP&#10;Country"
                rows={3}
                {...register("clientAddress")}
              />
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
                  <div className="grid grid-cols-12 gap-2 mb-2 text-sm font-medium text-muted-foreground">
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
                        className="grid grid-cols-12 gap-2 mb-4 items-start"
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
              <div className="flex justify-between text-lg font-semibold">
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
