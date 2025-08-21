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
    doc.setFontSize(14);

    // Serbian test string
    // const serbian = "ČćŠšĐđŽž — Primer: Nikola Jovanović";
    // doc.text(serbian, 40, 60);

    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Colors
    const primaryColor = [41, 128, 185]; // Blue
    const grayColor = [128, 128, 128];

    // Header Section
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 35, "F");

    // FAKTURA title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(family, "bold", 700);
    doc.text("FAKTURA", margin, 25);
    doc.setFont(family, "normal", 400);

    // Invoice number and date (white text on blue background)
    doc.setFontSize(12);
    doc.text(`# ${data.brojFakture}`, pageWidth - margin - 60, 20);
    doc.text(`Datum: ${data.datumFakture}`, pageWidth - margin - 60, 30);

    // Reset text color
    doc.setTextColor(0, 0, 0);

    let yPos = 50;

    // Company Information Section
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("IZDAVALAC FAKTURE", margin, yPos);

    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(data.naziv, margin, yPos);

    yPos += 6;

    // Split address into lines
    const addressLines = data.adresa.split("\n");
    addressLines.forEach((line) => {
      if (line.trim()) {
        doc.text(line.trim(), margin, yPos);
        yPos += 5;
      }
    });

    doc.text(`PIB: ${data.pib}`, margin, yPos);
    yPos += 5;
    doc.text(`Matični broj: ${data.maticniBroj}`, margin, yPos);
    yPos += 5;
    doc.text(`Email: ${data.kontaktEmail}`, margin, yPos);
    yPos += 5;
    doc.text(`Tekući račun: ${data.tekuciRacun}`, margin, yPos);

    // Calculate total for QR and display
    const total = data.items.reduce((sum, item) => sum + item.iznos, 0);

    // Generate and add QR Code
    const qrString = generateQRString(data, total);

    try {
      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        width: 150,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });

      // Add QR Code (top right)
      const qrSize = 40;
      const qrX = pageWidth - margin - qrSize;
      const qrY = 45;
      doc.addImage(qrCodeDataURL, "PNG", qrX, qrY, qrSize, qrSize);

      // QR Code label
      doc.setFontSize(8);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text("QR kod za plaćanje", qrX, qrY + qrSize + 5);
      doc.setTextColor(0, 0, 0);
    } catch (error) {
      console.error("Error generating QR code:", error);
      // Add fallback text if QR code fails
      doc.setFontSize(8);
      doc.setTextColor(200, 0, 0);
      doc.text("QR kod nije dostupan", pageWidth - margin - 60, 65);
      doc.setTextColor(0, 0, 0);
    }

    // Client Information Section
    yPos = Math.max(yPos + 20, 110); // Ensure we don't overlap with QR code

    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("PRIMA FAKTURE", margin, yPos);

    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(data.clientNaziv, margin, yPos);

    yPos += 6;

    // Split client address into lines
    const clientAddressLines = data.clientAdresa.split("\n");
    clientAddressLines.forEach((line) => {
      if (line.trim()) {
        doc.text(line.trim(), margin, yPos);
        yPos += 5;
      }
    });

    doc.text(`PIB: ${data.clientPib}`, margin, yPos);
    yPos += 5;
    doc.text(`Matični broj: ${data.clientMaticniBroj}`, margin, yPos);

    // Items table
    yPos += 20;

    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos - 5, pageWidth - margin * 2, 15, "F");

    doc.setFontSize(10);
    doc.text("#", margin + 3, yPos + 3);
    doc.text("OPIS", margin + 15, yPos + 3);
    doc.text("IZNOS (RSD)", pageWidth - margin - 35, yPos + 3);

    // Table header line
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos + 8, pageWidth - margin, yPos + 8);

    yPos += 18;

    // Table items
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);

    data.items.forEach((item, index) => {
      const rowHeight = 12;

      // Alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(margin, yPos - 3, pageWidth - margin * 2, rowHeight, "F");
      }

      // Item number
      doc.text(`${index + 1}`, margin + 3, yPos + 4);

      // Item description (with text wrapping)
      const descriptionLines = doc.splitTextToSize(item.opis, 120);
      doc.text(descriptionLines, margin + 15, yPos + 4);

      // Item amount (right aligned)
      const amountText = `${item.iznos.toLocaleString("sr-RS", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} RSD`;
      const amountWidth = doc.getTextWidth(amountText);
      doc.text(amountText, pageWidth - margin - amountWidth - 3, yPos + 4);

      yPos += Math.max(rowHeight, descriptionLines.length * 5 + 6);

      // Row separator
      doc.line(margin, yPos - 6, pageWidth - margin, yPos - 6);
    });

    // Total section
    yPos += 10;

    // Total background
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(pageWidth - margin - 80, yPos - 5, 80, 20, "F");

    // Total text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text("UKUPNO:", pageWidth - margin - 75, yPos + 3);

    const totalText = `${total.toLocaleString("sr-RS", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} RSD`;
    const totalWidth = doc.getTextWidth(totalText);
    doc.text(totalText, pageWidth - margin - totalWidth - 5, yPos + 10);

    // Reset text color
    doc.setTextColor(0, 0, 0);
    yPos += 35;

    // Additional information sections
    if (data.napomene?.trim()) {
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("NAPOMENE", margin, yPos);

      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      const notesLines = doc.splitTextToSize(
        data.napomene,
        pageWidth - margin * 2,
      );
      doc.text(notesLines, margin, yPos);
      yPos += notesLines.length * 5 + 10;
    }

    if (data.uslovi?.trim()) {
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("USLOVI", margin, yPos);

      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      const termsLines = doc.splitTextToSize(
        data.uslovi,
        pageWidth - margin * 2,
      );
      doc.text(termsLines, margin, yPos);
    }

    // Footer
    const footerY = pageHeight - 20;
    doc.setFontSize(8);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(
      `Faktura kreirana: ${new Date().toLocaleDateString("sr-RS")}`,
      margin,
      footerY,
    );

    // Page border
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(1);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

    // Save the PDF
    doc.save(`faktura-${data.brojFakture}.pdf`);
  } catch (err) {
    console.error("PDF generation failed:", err);
    alert("Failed to create PDF — check console.");
  }
}
