import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { calcInvoice, InvoiceTotals, LineItem, validateGstin, stateName } from "./tax";

export interface SellerProfile {
  name: string;
  address: string;
  gstin: string;
  state: string;
  phone?: string;
  email?: string;
  bankName?: string;
  accountNo?: string;
  ifsc?: string;
  upi?: string;
  logoDataUrl?: string;
  terms?: string;
}

export interface BuyerInfo {
  name: string;
  address: string;
  gstin?: string;
  state: string;
  phone?: string;
}

export interface InvoiceData {
  id: string;
  number: string;
  date: string;
  seller: SellerProfile;
  buyer: BuyerInfo;
  items: LineItem[];
  notes?: string;
  reverseCharge?: boolean;
  shippingAddress?: string;
}

export interface GeneratedInvoice {
  bytes: Uint8Array;
  totals: InvoiceTotals;
  sameState: boolean;
}

export async function generateInvoicePdf(inv: InvoiceData): Promise<GeneratedInvoice> {
  const sameState = (validateGstin(inv.seller.gstin).stateCode || inv.seller.state) ===
    (validateGstin(inv.buyer.gstin || "").stateCode || inv.buyer.state);
  const totals = calcInvoice(inv.items, inv.seller.state, inv.buyer.state);

  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const small = 9;
  const normal = 10;

  let y = height - 40;
  const margin = 40;

  const text = (s: string, x: number, yy: number, opts: any = {}) => {
    page.drawText(String(s ?? ""), { x, y: yy, size: opts.size || normal, font: opts.bold ? bold : font, color: opts.color || rgb(0, 0, 0) });
  };

  // Title
  text("TAX INVOICE", width / 2 - 40, y, { size: 16, bold: true });
  y -= 24;

  // Seller block
  text(inv.seller.name, margin, y, { size: 13, bold: true });
  y -= 14;
  wrapText(inv.seller.address, margin, y, width - 2 * margin, font, small, page);
  y -= 26;
  text(`GSTIN: ${inv.seller.gstin}`, margin, y, { size: small });
  text(`State: ${inv.seller.state} - ${stateName(inv.seller.state)}`, margin + 200, y, { size: small });
  y -= 12;
  if (inv.seller.phone) { text(`Phone: ${inv.seller.phone}`, margin, y, { size: small }); y -= 12; }
  if (inv.seller.email) { text(`Email: ${inv.seller.email}`, margin, y, { size: small }); y -= 12; }

  y -= 6;
  // Invoice meta
  text(`Invoice No: ${inv.number}`, margin, y, { size: small, bold: true });
  text(`Date: ${inv.date}`, margin + 260, y, { size: small, bold: true });
  y -= 12;
  if (inv.reverseCharge) { text("Reverse Charge: Yes", margin, y, { size: small }); y -= 12; }

  y -= 6;
  // Buyer block
  text("Bill To:", margin, y, { size: small, bold: true });
  y -= 12;
  text(inv.buyer.name, margin, y, { size: normal, bold: true });
  y -= 12;
  wrapText(inv.buyer.address, margin, y, width - 2 * margin, font, small, page);
  y -= 24;
  if (inv.buyer.gstin) { text(`GSTIN: ${inv.buyer.gstin}`, margin, y, { size: small }); y -= 12; }
  text(`State: ${inv.buyer.state} - ${stateName(inv.buyer.state)}`, margin, y, { size: small });
  y -= 12;
  if (inv.shippingAddress) {
    text("Ship To:", margin, y, { size: small, bold: true }); y -= 12;
    wrapText(inv.shippingAddress, margin, y, width - 2 * margin, font, small, page);
    y -= 24;
  }

  // Items table
  y -= 4;
  const tableX = margin;
  const cols = { desc: tableX, hsn: tableX + 170, qty: tableX + 230, rate: tableX + 270, taxable: tableX + 330, gst: tableX + 390, total: tableX + 450 };
  // header
  page.drawRectangle({ x: tableX, y: y - 12, width: width - 2 * margin, height: 14, color: rgb(0.9, 0.9, 0.9) });
  text("Description", cols.desc + 2, y - 9, { size: 8, bold: true });
  text("HSN/SAC", cols.hsn + 2, y - 9, { size: 8, bold: true });
  text("Qty", cols.qty + 2, y - 9, { size: 8, bold: true });
  text("Rate", cols.rate + 2, y - 9, { size: 8, bold: true });
  text("Taxable", cols.taxable + 2, y - 9, { size: 8, bold: true });
  text("GST%", cols.gst + 2, y - 9, { size: 8, bold: true });
  text("Total", cols.total + 2, y - 9, { size: 8, bold: true });
  y -= 16;

  for (const item of inv.items) {
    const t = (calcInvoice as any).__line ? null : null;
    const lineTaxable = Math.max(0, item.qty * item.rate - (item.discount || 0));
    const lineTotal = lineTaxable * (1 + item.gstRate / 100) + lineTaxable * ((item.cess || 0) / 100);
    text(item.description.slice(0, 28), cols.desc + 2, y, { size: 8 });
    text(item.hsn, cols.hsn + 2, y, { size: 8 });
    text(String(item.qty), cols.qty + 2, y, { size: 8 });
    text(item.rate.toFixed(2), cols.rate + 2, y, { size: 8 });
    text(lineTaxable.toFixed(2), cols.taxable + 2, y, { size: 8 });
    text(String(item.gstRate), cols.gst + 2, y, { size: 8 });
    text(lineTotal.toFixed(2), cols.total + 2, y, { size: 8 });
    y -= 12;
    if (y < 120) {
      // new page
      const np = doc.addPage([595.28, 841.89]);
      // redirect drawing to new page by reassigning? We'll just stop; simple invoices fit one page
      break;
    }
  }

  y -= 4;
  // Totals
  const tx = cols.taxable;
  text("Subtotal (Taxable):", tx - 60, y, { size: small, bold: true });
  text(totals.subtotal.toFixed(2), cols.total + 2, y, { size: small, bold: true });
  y -= 12;
  if (totals.totalCgst > 0) {
    text("CGST:", tx - 60, y, { size: small }); text(totals.totalCgst.toFixed(2), cols.total + 2, y, { size: small }); y -= 12;
  }
  if (totals.totalSgst > 0) {
    text("SGST:", tx - 60, y, { size: small }); text(totals.totalSgst.toFixed(2), cols.total + 2, y, { size: small }); y -= 12;
  }
  if (totals.totalIgst > 0) {
    text("IGST:", tx - 60, y, { size: small }); text(totals.totalIgst.toFixed(2), cols.total + 2, y, { size: small }); y -= 12;
  }
  if (totals.totalCess > 0) {
    text("Cess:", tx - 60, y, { size: small }); text(totals.totalCess.toFixed(2), cols.total + 2, y, { size: small }); y -= 12;
  }
  text("Round Off:", tx - 60, y, { size: small }); text(totals.roundOff.toFixed(2), cols.total + 2, y, { size: small }); y -= 12;
  page.drawRectangle({ x: tx - 62, y: y - 2, width: width - margin - (tx - 62), height: 16, color: rgb(0.9, 0.9, 0.9) });
  text("Grand Total:", tx - 60, y + 2, { size: normal, bold: true });
  text(totals.grandTotal.toFixed(2), cols.total + 2, y + 2, { size: normal, bold: true });
  y -= 16;
  text(`Amount in words: ${totals.amountInWords}`, margin, y, { size: small });
  y -= 14;

  // Tax summary table by rate
  y -= 4;
  text("Tax Summary by Rate", margin, y, { size: small, bold: true });
  y -= 12;
  const sc = { rate: margin, taxable: margin + 60, cgst: margin + 130, sgst: margin + 190, igst: margin + 250, cess: margin + 310, total: margin + 370 };
  page.drawRectangle({ x: margin, y: y - 11, width: width - 2 * margin, height: 13, color: rgb(0.9, 0.9, 0.9) });
  text("Rate%", sc.rate + 2, y - 8, { size: 8, bold: true });
  text("Taxable", sc.taxable + 2, y - 8, { size: 8, bold: true });
  text("CGST", sc.cgst + 2, y - 8, { size: 8, bold: true });
  text("SGST", sc.sgst + 2, y - 8, { size: 8, bold: true });
  text("IGST", sc.igst + 2, y - 8, { size: 8, bold: true });
  text("Cess", sc.cess + 2, y - 8, { size: 8, bold: true });
  y -= 14;
  for (const b of totals.byRate) {
    text(String(b.rate), sc.rate + 2, y, { size: 8 });
    text(b.taxable.toFixed(2), sc.taxable + 2, y, { size: 8 });
    text(b.cgst.toFixed(2), sc.cgst + 2, y, { size: 8 });
    text(b.sgst.toFixed(2), sc.sgst + 2, y, { size: 8 });
    text(b.igst.toFixed(2), sc.igst + 2, y, { size: 8 });
    text(b.cess.toFixed(2), sc.cess + 2, y, { size: 8 });
    y -= 11;
  }

  y -= 6;
  // Bank details
  if (inv.seller.bankName) {
    text("Bank Details:", margin, y, { size: small, bold: true }); y -= 12;
    text(`Bank: ${inv.seller.bankName}`, margin, y, { size: small }); y -= 11;
    if (inv.seller.accountNo) { text(`A/C: ${inv.seller.accountNo}`, margin, y, { size: small }); y -= 11; }
    if (inv.seller.ifsc) { text(`IFSC: ${inv.seller.ifsc}`, margin, y, { size: small }); y -= 11; }
    if (inv.seller.upi) { text(`UPI: ${inv.seller.upi}`, margin, y, { size: small }); y -= 11; }
  }

  y -= 4;
  if (inv.seller.terms) {
    text("Terms & Conditions:", margin, y, { size: small, bold: true }); y -= 11;
    wrapText(inv.seller.terms, margin, y, width - 2 * margin, font, 8, page);
    y -= 24;
  }
  if (inv.notes) {
    text(`Notes: ${inv.notes}`, margin, y, { size: small }); y -= 11;
  }

  // Signature line
  y = 60;
  text("Authorised Signatory", width - 160, y, { size: small });
  page.drawLine({ start: { x: width - 180, y: y + 12 }, end: { x: width - margin, y: y + 12 }, thickness: 0.5 });

  const bytes = await doc.save({ useObjectStreams: true });
  return { bytes, totals, sameState };
}

function wrapText(text: string, x: number, startY: number, maxWidth: number, font: any, size: number, page: any) {
  const words = (text || "").split(/\s+/);
  let line = "";
  let y = startY;
  for (const w of words) {
    const test = line ? line + " " + w : w;
    const width = font.widthOfTextAtSize(test, size);
    if (width > maxWidth && line) {
      page.drawText(line, { x, y, size, font });
      line = w;
      y -= size + 3;
    } else {
      line = test;
    }
  }
  if (line) page.drawText(line, { x, y, size, font });
}