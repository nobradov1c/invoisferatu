import jsPDF from "jspdf";
import type { InvoiceFormData } from "./invoice-schema";

export function generateInvoicePDF(data: InvoiceFormData): void {
  const doc = new jsPDF();

  // Set up fonts and colors
  doc.setFont("helvetica");

  // Company Information (Top Left)
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(data.companyName, 20, 30);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const companyAddressLines = data.companyAddress.split("\n");
  let yPosition = 40;
  companyAddressLines.forEach((line) => {
    doc.text(line, 20, yPosition);
    yPosition += 5;
  });

  // Invoice Title and Number (Top Right)
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 150, 30);

  doc.setFontSize(12);
  doc.text(`# ${data.invoiceNumber}`, 150, 45);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice Date: ${data.invoiceDate}`, 150, 60);
  doc.text(`Terms: ${data.terms}`, 150, 70);

  // Bill To Section
  yPosition = 80;
  doc.setFont("helvetica", "bold");
  doc.text("Bill To", 20, yPosition);

  doc.setFont("helvetica", "normal");
  yPosition += 10;
  doc.text(data.clientName, 20, yPosition);

  const clientAddressLines = data.clientAddress.split("\n");
  clientAddressLines.forEach((line) => {
    yPosition += 5;
    doc.text(line, 20, yPosition);
  });

  // Calculate totals
  const subtotal = data.items.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0,
  );
  const taxAmount = subtotal * (data.taxRate / 100);
  const total = subtotal + taxAmount;

  // Balance Due (Top Right)
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Balance Due", 150, 80);
  doc.setFontSize(16);
  doc.text(
    `$${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    150,
    95,
  );

  // Items Table
  yPosition = 120;

  // Table Headers
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("#", 20, yPosition);
  doc.text("Item & Description", 30, yPosition);
  doc.text("Qty", 120, yPosition);
  doc.text("Rate", 140, yPosition);
  doc.text("Amount", 170, yPosition);

  // Table Header Line
  doc.line(20, yPosition + 2, 190, yPosition + 2);

  yPosition += 10;

  // Table Items
  doc.setFont("helvetica", "normal");
  data.items.forEach((item, index) => {
    const amount = item.quantity * item.rate;

    doc.text(`${index + 1}`, 20, yPosition);

    // Handle multi-line descriptions
    const descriptionLines = doc.splitTextToSize(item.description, 85);
    doc.text(descriptionLines, 30, yPosition);

    doc.text(item.quantity.toString(), 120, yPosition);
    doc.text(
      `$${item.rate.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      140,
      yPosition,
    );
    doc.text(
      `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      170,
      yPosition,
    );

    yPosition += Math.max(10, descriptionLines.length * 5);
  });

  // Totals Section
  yPosition += 10;
  doc.line(120, yPosition, 190, yPosition);
  yPosition += 10;

  doc.setFont("helvetica", "normal");
  doc.text("Sub Total", 140, yPosition);
  doc.text(
    `$${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    170,
    yPosition,
  );

  yPosition += 8;
  doc.text(`Tax Rate`, 140, yPosition);
  doc.text(`${data.taxRate}%`, 170, yPosition);

  yPosition += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Total", 140, yPosition);
  doc.text(
    `$${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    170,
    yPosition,
  );

  yPosition += 8;
  doc.text("Balance Due", 140, yPosition);
  doc.text(
    `$${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    170,
    yPosition,
  );

  // Notes Section
  if (data.notes) {
    yPosition += 20;
    doc.setFont("helvetica", "bold");
    doc.text("Notes", 20, yPosition);

    doc.setFont("helvetica", "normal");
    yPosition += 8;
    const notesLines = doc.splitTextToSize(data.notes, 170);
    doc.text(notesLines, 20, yPosition);
    yPosition += notesLines.length * 5;
  }

  // Terms & Conditions
  if (data.termsAndConditions) {
    yPosition += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Terms & Conditions", 20, yPosition);

    doc.setFont("helvetica", "normal");
    yPosition += 8;
    const termsLines = doc.splitTextToSize(data.termsAndConditions, 170);
    doc.text(termsLines, 20, yPosition);
  }

  // Save the PDF
  doc.save(`invoice-${data.invoiceNumber}.pdf`);
}
