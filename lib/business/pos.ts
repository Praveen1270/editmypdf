import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { uid } from "./storage";

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  gstRate: number;
  hsn: string;
  unit: string;
  stock: number;
  category: string;
}

export interface CartLine {
  product: Product;
  qty: number;
  discount: number; // per line amount
}

export interface Sale {
  id: string;
  number: string;
  date: string;
  lines: { name: string; sku: string; qty: number; rate: number; gstRate: number; discount: number }[];
  subtotal: number;
  tax: number;
  total: number;
  payment: string;
  paid: number;
  change: number;
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((s, l) => s + l.product.price * l.qty - l.discount, 0);
}

export function cartTax(lines: CartLine[]): number {
  return lines.reduce((s, l) => {
    const taxable = l.product.price * l.qty - l.discount;
    return s + taxable * (l.product.gstRate / 100);
  }, 0);
}

export function cartTotal(lines: CartLine[]): number {
  return Math.round((cartSubtotal(lines) + cartTax(lines)) * 100) / 100;
}

export async function generateReceiptPdf(sale: Sale, shopName: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  // 80mm width
  const w = 226; // 80mm in pt
  const h = 600;
  const page = doc.addPage([w, h]);
  const font = await doc.embedFont(StandardFonts.Courier);
  const bold = await doc.embedFont(StandardFonts.CourierBold);
  let y = h - 20;
  const cx = (s: string, f: any, size: number) => {
    const tw = f.widthOfTextAtSize(s, size);
    page.drawText(s, { x: (w - tw) / 2, y, size, font: f, color: rgb(0, 0, 0) });
    y -= size + 3;
  };
  const left = (s: string, f: any = font, size: number = 9) => {
    page.drawText(s, { x: 6, y, size, font: f, color: rgb(0, 0, 0) });
    y -= size + 2;
  };

  cx(shopName || "Shop", bold, 12);
  cx("RECEIPT", bold, 10);
  cx(sale.number, font, 9);
  cx(sale.date, font, 9);
  left("-".repeat(32), font, 8);
  for (const l of sale.lines) {
    left(`${l.name} x${l.qty}`, font, 9);
    left(`  ${l.rate.toFixed(2)} * ${l.qty} = ${(l.rate * l.qty).toFixed(2)}  GST ${l.gstRate}%`, font, 8);
    if (l.discount) left(`  Disc: -${l.discount.toFixed(2)}`, font, 8);
  }
  left("-".repeat(32), font, 8);
  left(`Subtotal: ${sale.subtotal.toFixed(2)}`, font, 9);
  left(`Tax: ${sale.tax.toFixed(2)}`, font, 9);
  left(`TOTAL: ${sale.total.toFixed(2)}`, bold, 10);
  left(`Payment: ${sale.payment}`, font, 9);
  left(`Paid: ${sale.paid.toFixed(2)}`, font, 9);
  left(`Change: ${sale.change.toFixed(2)}`, font, 9);
  left("-".repeat(32), font, 8);
  cx("Thank you!", font, 9);

  return await doc.save();
}

export { uid };