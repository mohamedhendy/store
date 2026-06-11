'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, XCircle } from 'lucide-react';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { fetchInvoiceByBarcode } from '@/lib/api';
import { useStore } from '@/lib/store';

export default function ScanInvoicePage() {
  const router = useRouter();
  const setInvoice = useStore((s) => s.setInvoice);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (barcode: string) => {
    setLoading(true);
    const invoice = await fetchInvoiceByBarcode(barcode);
    setLoading(false);
    if (invoice) {
      setInvoice(invoice);
      router.push(`/verify/${barcode}`);
    } else {
      setError(`Invoice not found: ${barcode}`);
      setTimeout(() => setError(null), 4000);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pt-2">
        <Link
          href="/"
          className="p-2 rounded-md hover:bg-muted transition-colors flex-shrink-0"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-base font-semibold">Scan invoice</h1>
          <p className="text-xs text-muted-foreground">
            Scan the invoice-level barcode to load an order
          </p>
        </div>
      </div>

      {/* Scanner card */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <BarcodeScanner onScan={handleScan} />

        {/* Loading */}
        {loading && (
          <p className="text-xs text-center text-muted-foreground animate-pulse">
            Looking up invoice…
          </p>
        )}

        {/* Error banner */}
        {error && (
          <div
            className="flex items-center gap-3 p-3 rounded-lg animate-slide-in"
            style={{
              backgroundColor: 'var(--color-error-bg)',
              border: '0.5px solid var(--color-error-border)',
            }}
            role="alert"
            aria-live="assertive"
          >
            <XCircle
              className="w-4 h-4 flex-shrink-0"
              style={{ color: 'var(--color-error-text)' }}
            />
            <p className="text-sm font-medium" style={{ color: 'var(--color-error-text)' }}>
              {error}
            </p>
          </div>
        )}
      </div>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        Try barcode: <span className="font-mono">255258722</span>
      </p>
    </main>
  );
}
