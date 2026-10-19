"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Plus, Trash2, Download, RefreshCw, Loader2, Package, BarChart3 } from "lucide-react";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { Product, CartLine, Sale, cartSubtotal, cartTax, cartTotal, generateReceiptPdf } from "@/lib/business/pos";
import { dbGetAll, dbPut, dbDelete, uid } from "@/lib/business/storage";
import { downloadBytes } from "@/lib/files/download";

type Tab = "billing" | "products" | "reports";

export default function PosBillingPage() {
  const [tab, setTab] = useState<Tab>("billing");
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [search, setSearch] = useState("");
  const [shopName, setShopName] = useState("My Shop");
  const [payment, setPayment] = useState("Cash");
  const [paid, setPaid] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // product form
  const [pName, setPName] = useState("");
  const [pSku, setPSku] = useState("");
  const [pPrice, setPPrice] = useState(0);
  const [pGst, setPGst] = useState(18);
  const [pStock, setPStock] = useState(0);
  const [pUnit, setPUnit] = useState("pcs");
  const [pHsn, setPHsn] = useState("");
  const [pCategory, setPCategory] = useState("");

  useEffect(() => {
    dbGetAll("products").then(setProducts);
    dbGetAll("sales").then(setSales);
  }, []);

  const refresh = async () => {
    setProducts(await dbGetAll("products"));
    setSales(await dbGetAll("sales"));
  };

  const addProduct = async () => {
    if (!pName) { setErrorMessage("Product name required"); return; }
    const prod: Product = { id: uid(), name: pName, sku: pSku || uid().slice(0, 6), price: pPrice, gstRate: pGst, hsn: pHsn, unit: pUnit, stock: pStock, category: pCategory };
    await dbPut("products", prod);
    await refresh();
    setPName(""); setPSku(""); setPPrice(0); setPStock(0); setPHsn(""); setPCategory("");
  };

  const deleteProduct = async (id: string) => {
    await dbDelete("products", id);
    await refresh();
  };

  const addToCart = (prod: Product) => {
    setCart((c) => {
      const existing = c.find((l) => l.product.id === prod.id);
      if (existing) return c.map((l) => l.product.id === prod.id ? { ...l, qty: l.qty + 1 } : l);
      return [...c, { product: prod, qty: 1, discount: 0 }];
    });
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) { setCart((c) => c.filter((l) => l.product.id !== id)); return; }
    setCart((c) => c.map((l) => l.product.id === id ? { ...l, qty } : l));
  };

  const removeFromCart = (id: string) => setCart((c) => c.filter((l) => l.product.id !== id));

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const subtotal = cartSubtotal(cart);
      const tax = cartTax(cart);
      const total = cartTotal(cart);
      const sale: Sale = {
        id: uid(),
        number: `R-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        lines: cart.map((l) => ({ name: l.product.name, sku: l.product.sku, qty: l.qty, rate: l.product.price, gstRate: l.product.gstRate, discount: l.discount })),
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        total,
        payment,
        paid: paid || total,
        change: (paid || total) - total,
      };
      await dbPut("sales", sale);
      // decrement stock
      for (const l of cart) {
        const p = products.find((x) => x.id === l.product.id);
        if (p) await dbPut("products", { ...p, stock: Math.max(0, p.stock - l.qty) });
      }
      const bytes = await generateReceiptPdf(sale, shopName);
      downloadBytes(bytes, `${sale.number}.pdf`, "application/pdf");
      setCart([]);
      setPaid(0);
      await refresh();
    } catch (err: any) {
      setErrorMessage(`Checkout failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  // report totals
  const today = new Date().toDateString();
  const todaySales = sales.filter((s) => new Date(s.date).toDateString() === today);
  const todayTotal = todaySales.reduce((s, x) => s + x.total, 0);

  const exportSalesCsv = () => {
    const rows = ["Number,Date,Total,Payment", ...sales.map((s) => `${s.number},${s.date},${s.total},${s.payment}`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "sales.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolPageLayout toolId="pos-billing" toolName="POS Billing" description="Point-of-sale billing: products, cart, GST receipts and reports, usable offline.">
      <div className="space-y-4">
        {errorMessage && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">{errorMessage}</div>}

        <div className="flex gap-2 border-b border-border pb-2">
          {(["billing", "products", "reports"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${tab === t ? "bg-foreground text-background" : "border border-border text-muted-foreground hover:text-foreground"}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <input placeholder="Shop name" value={shopName} onChange={(e) => setShopName(e.target.value)} className="rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs w-48" />

        {tab === "products" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <input placeholder="Name" value={pName} onChange={(e) => setPName(e.target.value)} className="rounded-lg border border-border bg-surface-base px-2 py-1.5 text-xs" />
              <input placeholder="SKU" value={pSku} onChange={(e) => setPSku(e.target.value)} className="rounded-lg border border-border bg-surface-base px-2 py-1.5 text-xs" />
              <input type="number" placeholder="Price" value={pPrice} onChange={(e) => setPPrice(Number(e.target.value))} className="rounded-lg border border-border bg-surface-base px-2 py-1.5 text-xs" />
              <input type="number" placeholder="GST%" value={pGst} onChange={(e) => setPGst(Number(e.target.value))} className="rounded-lg border border-border bg-surface-base px-2 py-1.5 text-xs" />
              <input type="number" placeholder="Stock" value={pStock} onChange={(e) => setPStock(Number(e.target.value))} className="rounded-lg border border-border bg-surface-base px-2 py-1.5 text-xs" />
              <input placeholder="Unit" value={pUnit} onChange={(e) => setPUnit(e.target.value)} className="rounded-lg border border-border bg-surface-base px-2 py-1.5 text-xs" />
              <input placeholder="HSN" value={pHsn} onChange={(e) => setPHsn(e.target.value)} className="rounded-lg border border-border bg-surface-base px-2 py-1.5 text-xs" />
              <input placeholder="Category" value={pCategory} onChange={(e) => setPCategory(e.target.value)} className="rounded-lg border border-border bg-surface-base px-2 py-1.5 text-xs" />
            </div>
            <button onClick={addProduct} className="inline-flex items-center gap-1.5 rounded-lg bg-action-primary px-3 py-1.5 text-xs font-semibold text-action-primary-text hover:opacity-90">
              <Plus className="h-3.5 w-3.5" /> Add Product
            </button>
            <div className="space-y-2">
              {products.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-xs">
                  <span>{p.name} ({p.sku}) — ₹{p.price} — GST {p.gstRate}% — Stock {p.stock}</span>
                  <button onClick={() => deleteProduct(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
              {products.length === 0 && <p className="text-xs text-muted-foreground">No products yet.</p>}
            </div>
          </div>
        )}

        {tab === "billing" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <input placeholder="Search product..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-border bg-surface-base px-3 py-1.5 text-xs" />
              <div className="space-y-2 max-h-64 overflow-auto">
                {filteredProducts.map((p) => (
                  <button key={p.id} onClick={() => addToCart(p)} className="w-full flex items-center justify-between rounded-lg border border-border p-2 text-xs hover:bg-surface-subtle text-left">
                    <span>{p.name} ({p.sku})</span>
                    <span>₹{p.price} · stock {p.stock}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-bold">Cart</h4>
              {cart.map((l) => (
                <div key={l.product.id} className="flex items-center justify-between gap-2 rounded-lg border border-border p-2 text-xs">
                  <span className="flex-1">{l.product.name}</span>
                  <input type="number" value={l.qty} onChange={(e) => updateQty(l.product.id, Number(e.target.value))} className="w-12 rounded border border-border bg-surface-base px-1 py-0.5 text-xs" />
                  <span>₹{(l.product.price * l.qty).toFixed(2)}</span>
                  <button onClick={() => removeFromCart(l.product.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
              {cart.length === 0 && <p className="text-xs text-muted-foreground">Cart empty.</p>}
              {cart.length > 0 && (
                <div className="space-y-2 border-t border-border pt-2 text-xs">
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{cartSubtotal(cart).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Tax</span><span>₹{cartTax(cart).toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold"><span>Total</span><span>₹{cartTotal(cart).toFixed(2)}</span></div>
                  <div className="flex gap-2 items-center">
                    <select value={payment} onChange={(e) => setPayment(e.target.value)} className="rounded-lg border border-border bg-surface-base px-2 py-1 text-xs">
                      <option>Cash</option><option>UPI</option><option>Card</option><option>Split</option>
                    </select>
                    <input type="number" placeholder="Paid amount" value={paid} onChange={(e) => setPaid(Number(e.target.value))} className="rounded-lg border border-border bg-surface-base px-2 py-1 text-xs w-28" />
                  </div>
                  {isProcessing ? (
                    <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /><span>Processing…</span></div>
                  ) : (
                    <button onClick={handleCheckout} className="w-full rounded-lg bg-action-primary px-3 py-2 text-xs font-semibold text-action-primary-text hover:opacity-90">
                      Checkout & Print Receipt
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "reports" && (
          <div className="space-y-3">
            <div className="rounded-lg border border-border p-3 text-xs">
              <p className="font-bold">Today: {todaySales.length} sales, ₹{todayTotal.toFixed(2)}</p>
              <p>All time: {sales.length} sales, ₹{sales.reduce((s, x) => s + x.total, 0).toFixed(2)}</p>
            </div>
            <button onClick={exportSalesCsv} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-subtle">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            <div className="space-y-2 max-h-64 overflow-auto">
              {sales.slice().reverse().map((s) => (
                <div key={s.id} className="rounded-lg border border-border p-2 text-xs">
                  {s.number} — {new Date(s.date).toLocaleString()} — ₹{s.total} — {s.payment}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}