import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import type { InvoiceFormData } from "./invoice-schema";

function arrayBufferToBase64(ab: ArrayBuffer) {
  const uint8 = new Uint8Array(ab);
  const CHUNK_SIZE = 0x8000;
  let index = 0;
  let result = "";
  while (index < uint8.length) {
    const slice = uint8.subarray(
      index,
      Math.min(index + CHUNK_SIZE, uint8.length),
    );
    // biome-ignore lint/suspicious/noExplicitAny: reason
    result += String.fromCharCode.apply(null, slice as any);
    index += CHUNK_SIZE;
  }
  return btoa(result);
}

async function fetchFontBase64(path: string) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  const ab = await res.arrayBuffer();
  return arrayBufferToBase64(ab);
}

async function registerInterFonts(doc: jsPDF) {
  // Paths served from public/
  const variableFontB64 = await fetchFontBase64("/fonts/inter.ttf");

  doc.addFileToVFS("inter.ttf", variableFontB64);
  doc.addFont("inter.ttf", "Inter", "normal");

  return "Inter";
}

function generateQRString(data: InvoiceFormData, total: number): string {
  // Format total amount for QR code (e.g., "RSD2300,22")
  const totalString = total.toFixed(2).toString().replace(".", ",");
  const formattedTotal = `RSD${totalString}`;

  // Clean up company name for QR code - remove/replace problematic characters
  // Keep Serbian letters, alphanumeric, and convert spaces to hyphens
  const cleanCompanyName = data.naziv
    .replace(/[^a-zA-Z0-9ščćđžŠČĆĐŽ -]/g, "") // Remove other special chars
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
    .trim();

  // Clean up tekuci racun - remove any spaces or special formatting
  const cleanTekuciRacun = data.tekuciRacun.replace(/[^0-9]/g, "");

  // Build QR string according to specification
  const qrString = `K:PR|V:01|C:1|R:${cleanTekuciRacun}|N:${cleanCompanyName}|I:${formattedTotal}|SF:221`;

  return qrString;
}

export async function generateInvoicePDF(data: InvoiceFormData): Promise<void> {
  try {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    // Register fonts at runtime (client only)
    const family = await registerInterFonts(doc);
    // Use the registered font
    doc.setFont(family, "normal", 400);

    // Page dimensions and spacing constants
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40; // Increased margin for more breathing room
    const sectionSpacing = 25; // Standard spacing between sections
    const lineHeight = 14; // Standard line height
    const smallLineHeight = 12; // Smaller line height for dense text

    // Colors
    const primaryColor = [52, 73, 94]; // Darker blue-gray for better readability
    const accentColor = [41, 128, 185]; // Bright blue for highlights
    const lightGrayColor = [248, 249, 250]; // Very light gray for backgrounds
    const mediumGrayColor = [108, 117, 125]; // Medium gray for secondary text
    const borderColor = [222, 226, 230]; // Light border color

    // ===================
    // HEADER SECTION
    // ===================

    // Main header background - reduced height for better proportions
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 60, "F");

    // FAKTURA title - better positioned and sized
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont(family, "bold", 700);
    doc.text("FAKTURA", margin, 38);

    // Invoice details in header - better aligned
    doc.setFontSize(11);
    doc.setFont(family, "normal", 400);
    const headerRightX = pageWidth - margin;
    doc.text(
      `# ${data.brojFakture}`,
      headerRightX - doc.getTextWidth(`# ${data.brojFakture}`),
      25,
    );
    doc.text(
      `Datum: ${data.datumFakture}`,
      headerRightX - doc.getTextWidth(`Datum: ${data.datumFakture}`),
      40,
    );

    // Reset text color and font
    doc.setTextColor(0, 0, 0);
    doc.setFont(family, "normal", 400);

    let yPos = 85; // Start content well below header

    // ===================
    // COMPANY INFORMATION SECTION
    // ===================

    // Section header with improved styling
    doc.setFillColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
    doc.rect(margin, yPos - 8, (pageWidth - margin * 2) * 0.6, 22, "F");

    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("IZDAVALAC FAKTURE", margin + 8, yPos + 5);

    yPos += sectionSpacing;

    // Company name - larger and more prominent
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(data.naziv, margin + 8, yPos);

    yPos += lineHeight + 4;

    // Company details with better spacing
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    // Split address into lines with proper spacing
    const addressLines = data.adresa.split("\n");
    addressLines.forEach((line) => {
      if (line.trim()) {
        doc.text(line.trim(), margin + 8, yPos);
        yPos += smallLineHeight;
      }
    });

    yPos += 4; // Extra space before other details

    // Company registration details
    const companyDetails = [
      `PIB: ${data.pib}`,
      `Matični broj: ${data.maticniBroj}`,
      `Email: ${data.kontaktEmail}`,
      `Tekući račun: ${data.tekuciRacun}`,
    ];

    companyDetails.forEach((detail) => {
      doc.text(detail, margin + 8, yPos);
      yPos += smallLineHeight;
    });

    // ===================
    // QR CODE SECTION
    // ===================

    const total = data.items.reduce((sum, item) => sum + item.iznos, 0);
    const qrString = generateQRString(data, total);

    try {
      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });

      // Position QR code better
      const qrSize = 80;
      const qrX = pageWidth - margin - qrSize;
      const qrY = 90; // Align with company info section

      // QR code background
      doc.setFillColor(255, 255, 255);
      doc.rect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 20, "F");
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.setLineWidth(0.5);
      doc.rect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 20);

      doc.addImage(qrCodeDataURL, "PNG", qrX, qrY, qrSize, qrSize);

      // QR Code label - better positioned
      doc.setFontSize(8);
      doc.setTextColor(
        mediumGrayColor[0],
        mediumGrayColor[1],
        mediumGrayColor[2],
      );
      const qrLabel = "QR kod za plaćanje";
      const qrLabelWidth = doc.getTextWidth(qrLabel);
      doc.text(qrLabel, qrX + (qrSize - qrLabelWidth) / 2, qrY + qrSize + 12);
      doc.setTextColor(0, 0, 0);
    } catch (error) {
      console.error("Error generating QR code:", error);
      // Fallback if QR code fails
      doc.setFontSize(9);
      doc.setTextColor(200, 100, 100);
      doc.text("QR kod nije dostupan", pageWidth - margin - 90, 130);
      doc.setTextColor(0, 0, 0);
    }

    // ===================
    // CLIENT INFORMATION SECTION
    // ===================

    yPos = Math.max(yPos + sectionSpacing, 200); // Ensure we don't overlap with QR code

    // Client section header
    doc.setFillColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
    doc.rect(margin, yPos - 8, (pageWidth - margin * 2) * 0.6, 22, "F");

    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("RAČUN ZA", margin + 8, yPos + 5);

    yPos += sectionSpacing;

    // Client name - larger and more prominent
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(data.clientNaziv, margin + 8, yPos);

    yPos += lineHeight + 4;

    // Client details with better spacing
    doc.setFontSize(10);

    // Split client address into lines
    const clientAddressLines = data.clientAdresa.split("\n");
    clientAddressLines.forEach((line) => {
      if (line.trim()) {
        doc.text(line.trim(), margin + 8, yPos);
        yPos += smallLineHeight;
      }
    });

    yPos += 4; // Extra space before other details

    // Client registration details
    const clientDetails = [
      `PIB: ${data.clientPib}`,
      `Matični broj: ${data.clientMaticniBroj}`,
    ];

    clientDetails.forEach((detail) => {
      doc.text(detail, margin + 8, yPos);
      yPos += smallLineHeight;
    });

    // ===================
    // ITEMS TABLE
    // ===================

    yPos += sectionSpacing + 10;

    // Table header background
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    const tableHeaderHeight = 25;
    doc.rect(margin, yPos - 8, pageWidth - margin * 2, tableHeaderHeight, "F");

    // Table headers with better typography
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont(family, "bold", 700);

    const colPositions = {
      number: margin + 10,
      description: margin + 40,
      amount: pageWidth - margin - 80,
    };

    doc.text("#", colPositions.number, yPos + 7);
    doc.text("OPIS", colPositions.description, yPos + 7);
    doc.text("IZNOS (RSD)", colPositions.amount, yPos + 7);

    yPos += tableHeaderHeight;

    // Table items with improved styling
    doc.setFont(family, "normal", 400);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    data.items.forEach((item, index) => {
      const baseRowHeight = 20;

      // Description text wrapping
      const maxDescWidth = colPositions.amount - colPositions.description - 20;
      const descriptionLines = doc.splitTextToSize(item.opis, maxDescWidth);
      const rowHeight = Math.max(
        baseRowHeight,
        descriptionLines.length * 12 + 10,
      );

      // Alternating row colors with better contrast
      if (index % 2 === 0) {
        doc.setFillColor(
          lightGrayColor[0],
          lightGrayColor[1],
          lightGrayColor[2],
        );
        doc.rect(margin, yPos - 5, pageWidth - margin * 2, rowHeight, "F");
      }

      // Item number
      doc.setFont(family, "bold", 700);
      doc.text(`${index + 1}`, colPositions.number, yPos + 10);
      doc.setFont(family, "normal", 400);

      // Item description
      doc.text(descriptionLines, colPositions.description, yPos + 8);

      // Item amount - properly right-aligned
      const amountText = `${item.iznos.toLocaleString("sr-RS", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} RSD`;
      const amountWidth = doc.getTextWidth(amountText);
      doc.text(amountText, pageWidth - margin - 20 - amountWidth, yPos + 10);

      yPos += rowHeight;

      // Row separator line
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.setLineWidth(0.3);
      doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
    });

    // ===================
    // TOTAL SECTION
    // ===================

    yPos += 15;

    // Total section with improved styling
    const totalBoxWidth = 150;
    const totalBoxHeight = 35;
    const totalBoxX = pageWidth - margin - totalBoxWidth;

    // Total background
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(totalBoxX, yPos - 5, totalBoxWidth, totalBoxHeight, "F");

    // Total text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont(family, "bold", 700);
    doc.text("UKUPNO:", totalBoxX + 10, yPos + 10);

    const totalText = `${total.toLocaleString("sr-RS", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} RSD`;

    doc.setFontSize(16);
    const totalTextWidth = doc.getTextWidth(totalText);
    doc.text(
      totalText,
      totalBoxX + totalBoxWidth - totalTextWidth - 10,
      yPos + 25,
    );

    // Reset text formatting
    doc.setTextColor(0, 0, 0);
    doc.setFont(family, "normal", 400);
    yPos += totalBoxHeight + sectionSpacing;

    // ===================
    // ADDITIONAL INFORMATION
    // ===================

    // Notes section
    if (data.napomene?.trim()) {
      doc.setFillColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
      doc.rect(margin, yPos - 8, pageWidth - margin * 2, 18, "F");

      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont(family, "bold", 700);
      doc.text("NAPOMENE", margin + 8, yPos + 5);

      yPos += 25;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont(family, "normal", 400);

      const notesLines = doc.splitTextToSize(
        data.napomene,
        pageWidth - margin * 2 - 16,
      );
      doc.text(notesLines, margin + 8, yPos);
      yPos += notesLines.length * 12 + sectionSpacing;
    }

    // Terms section
    if (data.uslovi?.trim()) {
      doc.setFillColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
      doc.rect(margin, yPos - 8, pageWidth - margin * 2, 18, "F");

      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont(family, "bold", 700);
      doc.text("USLOVI", margin + 8, yPos + 5);

      yPos += 25;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont(family, "normal", 400);

      const termsLines = doc.splitTextToSize(
        data.uslovi,
        pageWidth - margin * 2 - 16,
      );
      doc.text(termsLines, margin + 8, yPos);
    }

    // ===================
    // FOOTER
    // ===================

    const footerY = pageHeight - 25;
    doc.setFontSize(8);
    doc.setTextColor(
      mediumGrayColor[0],
      mediumGrayColor[1],
      mediumGrayColor[2],
    );

    const footerText = `Faktura kreirana: ${new Date().toLocaleDateString("sr-RS")}`;
    doc.text(footerText, margin, footerY);

    // Save the PDF
    doc.save(`faktura-${data.brojFakture}.pdf`);
  } catch (err) {
    console.error("PDF generation failed:", err);
    alert("Failed to create PDF — check console.");
  }
}
