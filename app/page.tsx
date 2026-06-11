'use client';

import { useState, useCallback } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Check, ScanBarcode } from 'lucide-react';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import React from 'react';

type Phase = 'home' | 'scan-invoice' | 'scan-product' | 'result';

/* ── Step indicator (only shown during active steps) ─────── */
function StepBar({ phase }: { phase: Exclude<Phase, 'home'> }) {
  const steps = [
    { id: 'scan-invoice', ar: 'الفاتورة' },
    { id: 'scan-product', ar: 'المنتج' },
    { id: 'result', ar: 'النتيجة' },
  ] as const;

  const idx: Record<Exclude<Phase, 'home'>, number> = {
    'scan-invoice': 0,
    'scan-product': 1,
    result: 2,
  };
  const current = idx[phase];

  return (
    <div className="flex items-center mb-8">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                style={
                  done
                    ? { backgroundColor: 'var(--color-verified-text)', color: '#fff' }
                    : active
                    ? { backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }
                    : { backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }
                }
              >
                {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
              </div>
              <span className="text-[10px] text-muted-foreground">{step.ar}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-1 mb-4 transition-all duration-500"
                style={{ backgroundColor: done ? 'var(--color-verified-text)' : 'hsl(var(--muted))' }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── Barcode chip ────────────────────────────────────────── */
function BarcodeChip({ code, onReset }: { code: string; onReset: () => void }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-xl mb-5"
      style={{
        backgroundColor: 'var(--color-verified-bg)',
        border: '0.5px solid var(--color-verified-border)',
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div
          className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-verified-icon-bg)' }}
        >
          <Check className="w-3.5 h-3.5" style={{ color: 'var(--color-verified-text)' }} strokeWidth={3} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-muted-foreground">باركود الفاتورة</p>
          <p className="text-sm font-mono font-semibold truncate" style={{ color: 'var(--color-verified-text)' }} dir="ltr">
            {code}
          </p>
        </div>
      </div>
      <button
        onClick={onReset}
        className="p-1.5 rounded-lg hover:bg-black/5 transition-colors flex-shrink-0 me-1"
        aria-label="إعادة البدء"
      >
        <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
    </div>
  );
}

/* ── Result screen ───────────────────────────────────────── */
function ResultScreen({
  invoiceBarcode,
  productBarcode,
  onReset,
}: {
  invoiceBarcode: string;
  productBarcode: string;
  onReset: () => void;
}) {
  const matched = invoiceBarcode === productBarcode;

  return (
    <div className="flex flex-col items-center text-center gap-6 py-4 animate-fade-in">
      <div
        className="w-28 h-28 rounded-full flex items-center justify-center"
        style={{ backgroundColor: matched ? 'var(--color-verified-icon-bg)' : 'var(--color-error-icon-bg)' }}
      >
        {matched
          ? <CheckCircle2 style={{ width: 56, height: 56, color: 'var(--color-verified-text)' }} />
          : <XCircle style={{ width: 56, height: 56, color: 'var(--color-error-text)' }} />}
      </div>

      <div>
        <p className="text-3xl font-bold" style={{ color: matched ? 'var(--color-verified-text)' : 'var(--color-error-text)' }}>
          {matched ? 'مطابق ✓' : 'غير مطابق ✗'}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {matched ? 'المنتج صحيح — جاهز للتعبئة' : 'المنتج لا يتطابق مع الفاتورة'}
        </p>
      </div>

      <div
        className="w-full rounded-xl p-4 text-start space-y-3"
        style={
          matched
            ? { backgroundColor: 'var(--color-verified-bg)', border: '0.5px solid var(--color-verified-border)' }
            : { backgroundColor: 'var(--color-error-bg)', border: '0.5px solid var(--color-error-border)' }
        }
      >
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">باركود الفاتورة</p>
          <p className="text-sm font-mono font-semibold" dir="ltr"
            style={{ color: matched ? 'var(--color-verified-subtext)' : 'var(--color-error-subtext)' }}>
            {invoiceBarcode}
          </p>
        </div>
        {!matched && (
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">باركود المنتج الممسوح</p>
            <p className="text-sm font-mono font-semibold" dir="ltr" style={{ color: 'var(--color-error-text)' }}>
              {productBarcode}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={onReset}
        className="flex items-center justify-center gap-2 w-full min-h-[52px] rounded-xl text-base font-semibold transition-opacity hover:opacity-90"
        style={{ backgroundColor: 'var(--color-action-btn-bg)', color: 'var(--color-action-btn-text)' }}
      >
        <RotateCcw className="w-4 h-4" />
        فحص منتج آخر
      </button>
    </div>
  );
}

/* ── Home screen ─────────────────────────────────────────── */
function HomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col flex-1 animate-fade-in">
      {/* Hero */}
      <div className="flex flex-col items-center text-center flex-1 justify-center gap-6 py-12">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-background-secondary)' }}
        >
          <ScanBarcode className="w-12 h-12 text-foreground" />
        </div>

        <div>
          <h2 className="text-2xl font-bold">مرحباً بك</h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-xs">
            تحقق من تطابق باركود المنتج مع الفاتورة قبل التعبئة
          </p>
        </div>

        {/* How it works */}
        <div
          className="w-full rounded-xl p-4 text-start space-y-3"
          style={{ backgroundColor: 'var(--color-background-secondary)' }}
        >
          {[
            { n: '١', text: 'امسح الباركود من سطر المنتج في الفاتورة' },
            { n: '٢', text: 'امسح الباركود من صندوق المنتج' },
            { n: '٣', text: 'تحقق من التطابق فوراً' },
          ].map((step) => (
            <div key={step.n} className="flex items-center gap-3">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
              >
                {step.n}
              </span>
              <p className="text-sm text-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onStart}
        className="flex items-center justify-center gap-3 w-full min-h-[56px] rounded-xl text-base font-bold transition-opacity hover:opacity-90"
        style={{ backgroundColor: 'var(--color-action-btn-bg)', color: 'var(--color-action-btn-text)' }}
      >
        <ScanBarcode className="w-5 h-5" />
        ابدأ المسح
      </button>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────── */
export default function VerifyPage() {
  const [phase, setPhase] = useState<Phase>('home');
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
    setPhase('home');
    setInvoiceBarcode('');
    setProductBarcode('');
  };

  return (
    <main className="min-h-screen p-5 max-w-md mx-auto flex flex-col">
      {/* Header */}
      <div className="mb-6 pt-4 flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">OSSolution</h1>
        <p className="text-sm text-muted-foreground mt-0.5">فحص التعبئة</p>
      </div>

      {/* Home */}
      {phase === 'home' && <HomeScreen onStart={() => setPhase('scan-invoice')} />}

      {/* Steps */}
      {phase !== 'home' && <StepBar phase={phase} />}

      {phase === 'scan-invoice' && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <p className="text-lg font-semibold">امسح باركود الفاتورة</p>
            <p className="text-sm text-muted-foreground mt-1">
              وجّه الكاميرا نحو الباركود المطبوع على سطر المنتج في الفاتورة
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <BarcodeScanner onScan={handleInvoiceScan} />
          </div>
        </div>
      )}

      {phase === 'scan-product' && (
        <div className="space-y-4 animate-fade-in">
          <BarcodeChip code={invoiceBarcode} onReset={reset} />
          <div>
            <p className="text-lg font-semibold">امسح باركود الصندوق</p>
            <p className="text-sm text-muted-foreground mt-1">
              وجّه الكاميرا نحو الباركود المطبوع على صندوق المنتج
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <BarcodeScanner onScan={handleProductScan} />
          </div>
        </div>
      )}

      {phase === 'result' && (
        <ResultScreen
          invoiceBarcode={invoiceBarcode}
          productBarcode={productBarcode}
          onReset={reset}
        />
      )}
    </main>
  );
}
