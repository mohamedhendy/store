'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Printer, Plus } from 'lucide-react';
import { useStore } from '@/lib/store';
import { getInvoiceByBarcode } from '@/lib/invoiceData';

export default function CompletePage() {
  const params = useParams();
  const router = useRouter();
  const invoiceBarcode = params.invoiceBarcode as string;
  const { currentInvoice, setInvoice, reset } = useStore();

  useEffect(() => {
    if (currentInvoice?.invoiceBarcode === invoiceBarcode) return;
    const invoice = getInvoiceByBarcode(invoiceBarcode);
    if (invoice) {
      setInvoice(invoice);
    } else {
      router.replace('/');
    }
  }, [invoiceBarcode]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNewOrder = () => {
    reset();
    router.push('/');
  };

  if (!currentInvoice) return null;

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto print:p-0 print:max-w-none">
      {/* Screen-only header */}
      <div className="flex items-center gap-3 mb-6 pt-2 print:hidden">
        <Link
          href={`/verify/${invoiceBarcode}`}
          className="p-2 rounded-md hover:bg-muted transition-colors flex-shrink-0"
          aria-label="Back to verification"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-base font-semibold">Order complete</h1>
          <p className="text-xs text-muted-foreground">
            #{currentInvoice.id} · {currentInvoice.customer}
          </p>
        </div>
      </div>

      {/* Print-only header */}
      <div className="hidden print:block mb-6 border-b pb-4">
        <h1 className="text-xl font-bold">TASOOMA — Packing Slip</h1>
        <p className="text-sm text-gray-600 mt-1">
          Order #{currentInvoice.id} &nbsp;·&nbsp; {currentInvoice.customer} &nbsp;·&nbsp; {currentInvoice.date}
        </p>
      </div>

      {/* Items summary card */}
      <div className="rounded-lg border bg-card p-4 mb-4">
        <h2 className="text-sm font-semibold mb-3">Verified items</h2>
        <div className="divide-y divide-border">
          {currentInvoice.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--color-verified-bg)' }}
              >
                <Check
                  className="w-3.5 h-3.5"
                  style={{ color: 'var(--color-verified-text)' }}
                  strokeWidth={2.5}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {item.colour} · {item.size} · ×{item.qty} · SAR {item.price.toFixed(2)}
                </p>
              </div>
              <span
                className="text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0"
                style={{
                  backgroundColor: 'var(--color-verified-bg)',
                  color: 'var(--color-verified-text)',
                }}
              >
                ✓
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div
          className="mt-4 pt-3 border-t space-y-1"
          style={{ borderColor: 'var(--color-verified-border)' }}
        >
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Items</span>
            <span>{currentInvoice.items.length}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold">
            <span>Total</span>
            <span>
              SAR{' '}
              {currentInvoice.items
                .reduce((sum, i) => sum + i.price * i.qty, 0)
                .toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons — screen only */}
      <div className="space-y-2 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 w-full min-h-[48px] rounded-lg text-sm font-medium border border-input bg-background hover:bg-accent transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print packing slip
        </button>
        <button
          onClick={handleNewOrder}
          className="flex items-center justify-center gap-2 w-full min-h-[48px] rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Start new order
        </button>
      </div>
    </main>
  );
}
