"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { type InvoiceFormData, invoiceSchema } from "../lib/invoice-schema";
import { generateInvoicePDF } from "../lib/pdf-generator";

export default function InvoiceForm() {
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      companyName: "",
      companyAddress: "",
      invoiceNumber: `INV-${String(Date.now()).slice(-6)}`,
      invoiceDate: new Date().toISOString().split("T")[0],
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
    <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg">
      <h1 className="mb-8 text-center font-bold text-3xl text-gray-900">
        Invoice Generator
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Company Information */}
        <div className="rounded-lg bg-gray-50 p-6">
          <h2 className="mb-4 font-semibold text-gray-800 text-xl">
            Company Information
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium text-gray-700 text-sm">
                Company Name *
              </label>
              <input
                {...register("companyName")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Company Name"
              />
              {errors.companyName && (
                <p className="mt-1 text-red-600 text-sm">
                  {errors.companyName.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block font-medium text-gray-700 text-sm">
                Company Address *
              </label>
              <textarea
                {...register("companyAddress")}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Street Address&#10;City, State ZIP&#10;Country"
              />
              {errors.companyAddress && (
                <p className="mt-1 text-red-600 text-sm">
                  {errors.companyAddress.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="rounded-lg bg-gray-50 p-6">
          <h2 className="mb-4 font-semibold text-gray-800 text-xl">
            Invoice Details
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium text-gray-700 text-sm">
                Invoice Number *
              </label>
              <input
                {...register("invoiceNumber")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="INV-000001"
              />
              {errors.invoiceNumber && (
                <p className="mt-1 text-red-600 text-sm">
                  {errors.invoiceNumber.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block font-medium text-gray-700 text-sm">
                Invoice Date *
              </label>
              <input
                {...register("invoiceDate")}
                type="date"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.invoiceDate && (
                <p className="mt-1 text-red-600 text-sm">
                  {errors.invoiceDate.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block font-medium text-gray-700 text-sm">
                Due Date
              </label>
              <input
                {...register("dueDate")}
                type="date"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-2 block font-medium text-gray-700 text-sm">
                Terms
              </label>
              <input
                {...register("terms")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Due on Receipt"
              />
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="rounded-lg bg-gray-50 p-6">
          <h2 className="mb-4 font-semibold text-gray-800 text-xl">Bill To</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium text-gray-700 text-sm">
                Client Name *
              </label>
              <input
                {...register("clientName")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Client Name"
              />
              {errors.clientName && (
                <p className="mt-1 text-red-600 text-sm">
                  {errors.clientName.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block font-medium text-gray-700 text-sm">
                Client Address *
              </label>
              <textarea
                {...register("clientAddress")}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Street Address&#10;City, State ZIP&#10;Country"
              />
              {errors.clientAddress && (
                <p className="mt-1 text-red-600 text-sm">
                  {errors.clientAddress.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="rounded-lg bg-gray-50 p-6">
          <h2 className="mb-4 font-semibold text-gray-800 text-xl">Items</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-gray-300 border-b">
                  <th className="px-2 py-2 text-left font-medium text-gray-700 text-sm">
                    #
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-gray-700 text-sm">
                    Description *
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-gray-700 text-sm">
                    Qty *
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-gray-700 text-sm">
                    Rate *
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-gray-700 text-sm">
                    Amount
                  </th>
                  <th className="px-2 py-2 text-left font-medium text-gray-700 text-sm">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => {
                  const quantity = watchedItems?.[index]?.quantity || 0;
                  const rate = watchedItems?.[index]?.rate || 0;
                  const amount = quantity * rate;

                  return (
                    <tr key={field.id} className="border-gray-200 border-b">
                      <td className="px-2 py-2">
                        <span className="text-gray-600 text-sm">
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        <textarea
                          {...register(`items.${index}.description`)}
                          className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Item description"
                          rows={2}
                        />
                        {errors.items?.[index]?.description && (
                          <p className="mt-1 text-red-600 text-xs">
                            {errors.items[index]?.description?.message}
                          </p>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        <input
                          {...register(`items.${index}.quantity`, {
                            valueAsNumber: true,
                          })}
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        {errors.items?.[index]?.quantity && (
                          <p className="mt-1 text-red-600 text-xs">
                            {errors.items[index]?.quantity?.message}
                          </p>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        <input
                          {...register(`items.${index}.rate`, {
                            valueAsNumber: true,
                          })}
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-24 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                        {errors.items?.[index]?.rate && (
                          <p className="mt-1 text-red-600 text-xs">
                            {errors.items[index]?.rate?.message}
                          </p>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        <span className="text-gray-700 text-sm">
                          ${amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="font-medium text-red-600 text-sm hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={() => append({ description: "", quantity: 1, rate: 0 })}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Item
          </button>

          {errors.items && (
            <p className="mt-2 text-red-600 text-sm">{errors.items.message}</p>
          )}
        </div>

        {/* Totals & Tax */}
        <div className="rounded-lg bg-gray-50 p-6">
          <h2 className="mb-4 font-semibold text-gray-800 text-xl">
            Tax & Totals
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium text-gray-700 text-sm">
                Tax Rate (%)
              </label>
              <input
                {...register("taxRate", { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                max="100"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              {errors.taxRate && (
                <p className="mt-1 text-red-600 text-sm">
                  {errors.taxRate.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700 text-sm">Subtotal:</span>
                <span className="font-medium text-sm">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 text-sm">Tax:</span>
                <span className="font-medium text-sm">
                  ${taxAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Total:</span>
                <span className="font-semibold text-lg">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        <div className="rounded-lg bg-gray-50 p-6">
          <h2 className="mb-4 font-semibold text-gray-800 text-xl">
            Additional Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block font-medium text-gray-700 text-sm">
                Notes
              </label>
              <textarea
                {...register("notes")}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Thank you for your business!"
              />
            </div>
            <div>
              <label className="mb-2 block font-medium text-gray-700 text-sm">
                Terms & Conditions
              </label>
              <textarea
                {...register("termsAndConditions")}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="All services provided are subject to the terms and conditions outlined in the agreement or engagement letter."
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={isGenerating}
            className="rounded-lg bg-green-600 px-8 py-3 font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? "Generating PDF..." : "Generate Invoice PDF"}
          </button>
        </div>
      </form>
    </div>
  );
}
