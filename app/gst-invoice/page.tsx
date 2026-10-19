"use client";

import { useState, useEffect } from "react";
import { Receipt, Plus, Trash2, Download, Save, RefreshCw, Loader2 } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { generateInvoicePdf, SellerProfile, BuyerInfo, InvoiceData } from "@/lib/business/invoice";
import { dbPut, dbGetAll, dbDelete, uid } from "@/lib/business/storage";
import { validateGstin, stateName } from "@/lib/business/tax";
import { downloadBytes } from "@/lib/files/download";

interface LineItem { description: string; hsn: string; qty: number; unit: string; rate: number; discount: number; gstRate: number; cess: number; }

const emptyLine = (): LineItem => ({ description: "", hsn: "", qty: 1, unit: "pcs", rate: 0, discount: 0, gstRate: 18, cess: 0 });

export default function GstInvoicePage() {
  const [seller, setSeller] = useState<SellerProfile>({ name: "", address: "", gstin: "", state: "", phone: "", email: "", terms: "Thanks for your business." });
  const [buyer, setBuyer] = useState<BuyerInfo>({ name: "", address: "", gstin: "", state: "", phone: "" });
  const [items, setItems] = useState<LineItem[]>([emptyLine()]);
  const [invoiceNo, setInvoiceNo] = useState(`INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [reverseCharge, setReverseCharge] = useState(false);
  const [shipping, setShipping] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [gstinInfo, setGstinInfo] = useState("");

  useEffect(() => { dbGetAll("invoices").then(setHistory); }, []);

  const handleSellerGstin = (v: string) => {
    setSeller((s) => ({ ...s, gstin: v }));
    const r = validateGstin(v);
    if (r.valid) { setSeller((s) => ({ ...s, state: r.stateCode! })); setGstinInfo(r.stateName!); }
    else setGstinInfo("");
  };
  const handleBuyerGstin = (v: string) => {
    setBuyer((b) => ({ ...b, gstin: v }));
    const r = validateGstin(v);
    if (r.valid) { setBuyer((b) => ({ ...b, state: r.stateCode! })); }
  };

  const addItem = () => setItems((i) => [...i, emptyLine()]);
  const removeItem = (idx: number) => setItems((i) => i.filter((_, k) => k !== idx));
  const updateItem = (idx: number, key: keyof LineItem, val: any) => {
    setItems((i) => i.map((it, k) => (k === idx ? { ...it, [key]: val } : it)));
  };

  const handleGenerate = async () => {
    if (!seller.name || !buyer.name || items.length === 0) { setErrorMessage("Seller, buyer and at least one item are required."); return; }
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const inv: InvoiceData = {
        id: uid(),
        number: invoiceNo,
        date,
        seller: { ...seller, state: seller.state || "27" },
        buyer: { ...buyer, state: buyer.state || seller.state },
        items,
        notes,
        reverseCharge,
        shippingAddress: shipping || undefined,
      };
      const { bytes } = await generateInvoicePdf(inv);
      downloadBytes(bytes, `${invoiceNo}.pdf`, "application/pdf");
      await dbPut("invoices", { ...inv, savedAt: Date.now() });
      setHistory(await dbGetAll("invoices"));
    } catch (err: any) {
      setErrorMessage(`Failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveProfile = async () => {
    await dbPut("profile", { id: "seller", ...seller });
  };

  const loadProfile = async () => {
    const p = await dbGetAll("profile");
    if (p.length) { const { id, ...rest } = p[0]; setSeller(rest as SellerProfile); }
  };

  useEffect(() => { loadProfile(); }, []);

  const handleDeleteHistory = async (id: string) => {
    await dbDelete("invoices", id);
    setHistory(await dbGetAll("invoices"));
  };

  return (
    <ToolPageLayout toolId="gst-invoice" toolName="GST Invoice Generator" description="Create GST-compliant tax invoices with CGST/SGST or IGST and download a PDF with no watermark.">
      <div className="space-y-8">
        {errorMessage && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">{errorMessage}</div>}

        {/* Seller */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-foreground">Seller Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Business name" value={seller.name} onChange={(e) => setSeller({ ...seller, name: e.target.value })} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs" />
            <input placeholder="GSTIN" value={seller.gstin} onChange={(e) => handleSellerGstin(e.target.value)} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs" />
            <textarea placeholder="Address" value={seller.address} onChange={(e) => setSeller({ ...seller, address: e.target.value })} rows={2} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs sm:col-span-2" />
            <input placeholder="State code (e.g. 27)" value={seller.state} onChange={(e) => setSeller({ ...seller, state: e.target.value })} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs" />
            <span className="text-xs text-muted-foreground self-center">{gstinInfo || stateName(seller.state)}</span>
            <input placeholder="Phone" value={seller.phone} onChange={(e) => setSeller({ ...seller, phone: e.target.value })} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs" />
            <input placeholder="Email" value={seller.email} onChange={(e) => setSeller({ ...seller, email: e.target.value })} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs" />
            <input placeholder="Bank name" value={seller.bankName} onChange={(e) => setSeller({ ...seller, bankName: e.target.value })} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs" />
            <input placeholder="Account no." value={seller.accountNo} onChange={(e) => setSeller({ ...seller, accountNo: e.target.value })} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs" />
            <input placeholder="IFSC" value={seller.ifsc} onChange={(e) => setSeller({ ...seller, ifsc: e.target.value })} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs" />
            <input placeholder="UPI ID" value={seller.upi} onChange={(e) => setSeller({ ...seller, upi: e.target.value })} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs" />
            <textarea placeholder="Terms & conditions" value={seller.terms} onChange={(e) => setSeller({ ...seller, terms: e.target.value })} rows={2} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs sm:col-span-2" />
          </div>
          <button onClick={handleSaveProfile} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-subtle">
            <Save className="h-3.5 w-3.5" /> Save Profile
          </button>
        </section>

        {/* Invoice meta */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-foreground">Invoice Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input placeholder="Invoice number" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs" />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs" />
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={reverseCharge} onChange={(e) => setReverseCharge(e.target.checked)} /> Reverse charge</label>
          </div>
        </section>

        {/* Buyer */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-foreground">Buyer</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Buyer name" value={buyer.name} onChange={(e) => setBuyer({ ...buyer, name: e.target.value })} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs" />
            <input placeholder="Buyer GSTIN (optional)" value={buyer.gstin} onChange={(e) => handleBuyerGstin(e.target.value)} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs" />
            <textarea placeholder="Buyer address" value={buyer.address} onChange={(e) => setBuyer({ ...buyer, address: e.target.value })} rows={2} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs sm:col-span-2" />
            <input placeholder="State code" value={buyer.state} onChange={(e) => setBuyer({ ...buyer, state: e.target.value })} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs" />
            <input placeholder="Phone" value={buyer.phone} onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs" />
            <textarea placeholder="Shipping address (optional)" value={shipping} onChange={(e) => setShipping(e.target.value)} rows={2} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs sm:col-span-2" />
          </div>
        </section>

        {/* Items */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Line Items</h3>
            <button onClick={addItem} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-subtle">
              <Plus className="h-3.5 w-3.5" /> Add Item
            </button>
          </div>
          <div className="space-y-2">
            {items.map((it, idx) => (
              <div key={idx} className="grid grid-cols-2 sm:grid-cols-8 gap-2 items-center">
                <input placeholder="Description" value={it.description} onChange={(e) => updateItem(idx, "description", e.target.value)} className="rounded-lg border border-border bg-surface-base px-2 py-1.5 text-xs sm:col-span-2" />
                <input placeholder="HSN" value={it.hsn} onChange={(e) => updateItem(idx, "hsn", e.target.value)} className="rounded-lg border border-border bg-surface-base px-2 py-1.5 text-xs" />
                <input type="number" placeholder="Qty" value={it.qty} onChange={(e) => updateItem(idx, "qty", Number(e.target.value))} className="rounded-lg border border-border bg-surface-base px-2 py-1.5 text-xs" />
                <input placeholder="Unit" value={it.unit} onChange={(e) => updateItem(idx, "unit", e.target.value)} className="rounded-lg border border-border bg-surface-base px-2 py-1.5 text-xs" />
                <input type="number" placeholder="Rate" value={it.rate} onChange={(e) => updateItem(idx, "rate", Number(e.target.value))} className="rounded-lg border border-border bg-surface-base px-2 py-1.5 text-xs" />
                <input type="number" placeholder="GST%" value={it.gstRate} onChange={(e) => updateItem(idx, "gstRate", Number(e.target.value))} className="rounded-lg border border-border bg-surface-base px-2 py-1.5 text-xs" />
                <button onClick={() => removeItem(idx)} className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs" />
        </section>

        <div className="flex gap-2">
          {isProcessing ? (
            <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-xs">Generating…</span></div>
          ) : (
            <button onClick={handleGenerate} className="inline-flex items-center gap-1.5 rounded-lg bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-text hover:opacity-90">
              <Download className="h-4 w-4" /> Generate & Download Invoice
            </button>
          )}
        </div>

        {/* History */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-foreground">Saved Invoices ({history.length})</h3>
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-xs">
                <span>{h.number} — {h.buyer?.name} — {h.date}</span>
                <button onClick={() => handleDeleteHistory(h.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {history.length === 0 && <p className="text-xs text-muted-foreground">No saved invoices yet.</p>}
          </div>
        </section>
      </div>
    </ToolPageLayout>
  );
}