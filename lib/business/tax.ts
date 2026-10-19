export interface LineItem {
  description: string;
  hsn: string;
  qty: number;
  unit: string;
  rate: number;
  discount: number;
  gstRate: number;
  cess?: number;
}

export interface TaxLine {
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  total: number;
}

export interface InvoiceTotals {
  subtotal: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalCess: number;
  roundOff: number;
  grandTotal: number;
  amountInWords: string;
  byRate: { rate: number; taxable: number; cgst: number; sgst: number; igst: number; cess: number }[];
}

const STATE_NAMES: Record<string, string> = {
  "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
  "05": "Uttarakhand", "06": "Haryana", "07": "Delhi", "08": "Rajasthan",
  "09": "Uttar Pradesh", "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh",
  "13": "Nagaland", "14": "Manipur", "15": "Mizoram", "16": "Tripura",
  "17": "Meghalaya", "18": "Assam", "19": "West Bengal", "20": "Jharkhand",
  "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
  "25": "Daman & Diu", "26": "Dadra & Nagar Haveli", "27": "Maharashtra", "28": "Andhra Pradesh",
  "29": "Karnataka", "30": "Goa", "31": "Lakshadweep", "32": "Kerala",
  "33": "Tamil Nadu", "34": "Puducherry", "35": "Andaman & Nicobar", "36": "Telangana",
  "37": "Andhra Pradesh (New)", "38": "Ladakh",
};

export function stateName(code: string): string {
  return STATE_NAMES[code] || code;
}

export function validateGstin(gstin: string): { valid: boolean; stateCode?: string; stateName?: string; pan?: string } {
  const g = (gstin || "").trim().toUpperCase();
  if (g.length !== 15) return { valid: false };
  const stateCode = g.slice(0, 2);
  if (!STATE_NAMES[stateCode]) return { valid: false };
  const pan = g.slice(2, 12);
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) return { valid: false };
  // checksum
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const idx = chars.indexOf(g[i]);
    if (idx < 0) return { valid: false };
    let val = idx * (i % 2 === 0 ? 1 : 2);
    val = Math.floor(val / 36) + (val % 36);
    sum += val;
  }
  const check = chars[(36 - (sum % 36)) % 36];
  if (check !== g[14]) return { valid: false };
  return { valid: true, stateCode, stateName: STATE_NAMES[stateCode], pan };
}

export function calcLine(item: LineItem, sameState: boolean): TaxLine {
  const taxable = Math.max(0, item.qty * item.rate - (item.discount || 0));
  const tax = taxable * (item.gstRate / 100);
  const cess = taxable * ((item.cess || 0) / 100);
  let cgst = 0, sgst = 0, igst = 0;
  if (sameState) {
    cgst = tax / 2;
    sgst = tax / 2;
  } else {
    igst = tax;
  }
  const total = taxable + tax + cess;
  return { taxable, cgst, sgst, igst, cess, total };
}

export function calcInvoice(items: LineItem[], supplierState: string, buyerState: string): InvoiceTotals {
  const sameState = supplierState === buyerState;
  let subtotal = 0, totalCgst = 0, totalSgst = 0, totalIgst = 0, totalCess = 0;
  const byRateMap = new Map<number, { rate: number; taxable: number; cgst: number; sgst: number; igst: number; cess: number }>();

  for (const item of items) {
    const t = calcLine(item, sameState);
    subtotal += t.taxable;
    totalCgst += t.cgst;
    totalSgst += t.sgst;
    totalIgst += t.igst;
    totalCess += t.cess;
    const r = item.gstRate;
    if (!byRateMap.has(r)) byRateMap.set(r, { rate: r, taxable: 0, cgst: 0, sgst: 0, igst: 0, cess: 0 });
    const b = byRateMap.get(r)!;
    b.taxable += t.taxable;
    b.cgst += t.cgst;
    b.sgst += t.sgst;
    b.igst += t.igst;
    b.cess += t.cess;
  }

  const totalTax = totalCgst + totalSgst + totalIgst + totalCess;
  const rawTotal = subtotal + totalTax;
  const grandTotal = Math.round(rawTotal);
  const roundOff = +(grandTotal - rawTotal).toFixed(2);

  const byRate = Array.from(byRateMap.values()).sort((a, b) => a.rate - b.rate);

  return {
    subtotal: round2(subtotal),
    totalCgst: round2(totalCgst),
    totalSgst: round2(totalSgst),
    totalIgst: round2(totalIgst),
    totalCess: round2(totalCess),
    roundOff,
    grandTotal,
    amountInWords: numberToWords(grandTotal),
    byRate: byRate.map((b) => ({
      rate: b.rate,
      taxable: round2(b.taxable),
      cgst: round2(b.cgst),
      sgst: round2(b.sgst),
      igst: round2(b.igst),
      cess: round2(b.cess),
    })),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function numberToWords(n: number): string {
  if (n === 0) return "Zero Rupees Only";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  function twoDigit(x: number): string {
    if (x < 20) return ones[x];
    return tens[Math.floor(x / 10)] + (x % 10 ? " " + ones[x % 10] : "");
  }
  function threeDigit(x: number): string {
    if (x >= 100) return ones[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " + twoDigit(x % 100) : "");
    return twoDigit(x);
  }
  let num = Math.floor(n);
  const paise = Math.round((n - num) * 100);
  let words = "";
  if (num >= 10000000) {
    words += threeDigit(Math.floor(num / 10000000)) + " Crore ";
    num %= 10000000;
  }
  if (num >= 100000) {
    words += twoDigit(Math.floor(num / 100000)) + " Lakh ";
    num %= 100000;
  }
  if (num >= 1000) {
    words += twoDigit(Math.floor(num / 1000)) + " Thousand ";
    num %= 1000;
  }
  if (num > 0) words += threeDigit(num) + " ";
  words = words.trim() + " Rupees";
  if (paise > 0) words += " and " + twoDigit(paise) + " Paise";
  return words + " Only";
}