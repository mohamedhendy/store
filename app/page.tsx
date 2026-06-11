'use client';

import { useState, useCallback } from 'react';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { BarcodeScanner } from '@/components/BarcodeScanner';

type Phase = 'scan-invoice' | 'scan-product' | 'result';

export default function VerifyPage() {
  const [phase, setPhase] = useState<Phase>('scan-invoice');
  const [invoiceBarcode, setInvoiceBarcode] = useState('');
  const [productBarcode, setProductBarcode] = useState('');

  const handleInvoiceScan = useCallback((barcode: string) => {
    setInvoiceBarcode(barcode);
    setPhase('scan-product');
  }, []);

  const handleProductScan = useCallback((barcode: string) => {
    setProductBarcode(barcode);
    setPhase('result');
  }, []);

  const reset = () => {
    setPhase('scan-invoice');
    setInvoiceBarcode('');
    setProductBarcode('');
  };

  const isMatch = phase === 'result' && invoiceBarcode === productBarcode;

  return (
    <main className="min-h-screen p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6 pt-4">
        <h1 className="text-xl font-bold">OSSolution</h1>
        <p className="text-sm text-muted-foreground">Pack Verify</p>
      </div>

      {/* Step 1 — scan invoice barcode */}
      {phase === 'scan-invoice' && (
        <div className="space-y-4">
          <div>
            <p className="text-base font-semibold">Step 1</p>
            <p className="text-sm text-muted-foreground">Scan barcode from invoice line</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <BarcodeScanner onScan={handleInvoiceScan} />
          </div>
        </div>
      )}

      {/* Step 2 — scan product box barcode */}
      {phase === 'scan-product' && (
        <div className="space-y-4">
          <div
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ backgroundColor: 'var(--color-background-secondary)' }}
          >
            <div>
              <p className="text-xs text-muted-foreground">Invoice barcode</p>
              <p className="text-sm font-mono font-semibold mt-0.5">{invoiceBarcode}</p>
            </div>
            <button
              onClick={reset}
              className="text-xs text-muted-foreground hover:text-foreground p-1"
              aria-label="Start over"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <p className="text-base font-semibold">Step 2</p>
            <p className="text-sm text-muted-foreground">Scan barcode from product box</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <BarcodeScanner onScan={handleProductScan} />
          </div>
        </div>
      )}

      {/* Result */}
      {phase === 'result' && (
        <div className="flex flex-col items-center text-center gap-5 mt-6">
          {isMatch ? (
            <>
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-verified-icon-bg)' }}
              >
                <CheckCircle2 style={{ width: 48, height: 48, color: 'var(--color-verified-text)' }} />
              </div>

              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-verified-text)' }}>
                  Match
                </p>
                <p className="text-sm text-muted-foreground mt-1">Item verified — ready to pack</p>
              </div>

              <div
                className="w-full p-3 rounded-lg text-left"
                style={{
                  backgroundColor: 'var(--color-verified-bg)',
                  border: '0.5px solid var(--color-verified-border)',
                }}
              >
                <p className="text-xs text-muted-foreground mb-0.5">Barcode</p>
                <p className="text-sm font-mono font-medium" style={{ color: 'var(--color-verified-subtext)' }}>
                  {invoiceBarcode}
                </p>
              </div>
            </>
          ) : (
            <>
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-error-icon-bg)' }}
              >
                <XCircle style={{ width: 48, height: 48, color: 'var(--color-error-text)' }} />
              </div>

              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-error-text)' }}>
                  Wrong item
                </p>
                <p className="text-sm text-muted-foreground mt-1">Barcodes do not match</p>
              </div>

              <div
                className="w-full p-3 rounded-lg text-left space-y-3"
                style={{
                  backgroundColor: 'var(--color-error-bg)',
                  border: '0.5px solid var(--color-error-border)',
                }}
              >
                <div>
                  <p className="text-xs text-muted-foreground">Invoice barcode</p>
                  <p className="text-sm font-mono font-medium mt-0.5" style={{ color: 'var(--color-error-subtext)' }}>
                    {invoiceBarcode}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Product barcode</p>
                  <p className="text-sm font-mono font-medium mt-0.5" style={{ color: 'var(--color-error-text)' }}>
                    {productBarcode}
                  </p>
                </div>
              </div>
            </>
          )}

          <button
            onClick={reset}
            className="flex items-center gap-2 min-h-[48px] px-8 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors w-full justify-center"
          >
            <RotateCcw className="w-4 h-4" />
            Scan next item
          </button>
        </div>
      )}
    </main>
  );
}
