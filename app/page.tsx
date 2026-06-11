'use client';

import { useState, useCallback, useRef } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Check, ScanBarcode } from 'lucide-react';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import React from 'react';

type Phase = 'home' | 'scan-invoice' | 'scan-product' | 'result';

/* ── Feedback ────────────────────────────────────────────── */
function playBeep(type: 'success' | 'error') {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    if (type === 'success') {
      osc.frequency.setValueAtTime(820, ctx.currentTime);
      osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.12);
    } else {
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.setValueAtTime(280, ctx.currentTime + 0.12);
    }
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch { /* browser may block */ }
}

function haptic(type: 'success' | 'error') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(type === 'success' ? [80, 40, 80] : [300]);
  }
}

/* ── Step bar ────────────────────────────────────────────── */
function StepBar({ phase }: { phase: Exclude<Phase, 'home'> }) {
  const steps = [
    { id: 'scan-invoice', ar: 'الفاتورة' },
    { id: 'scan-product', ar: 'المنتج' },
    { id: 'result',       ar: 'النتيجة' },
  ] as const;
  const idx: Record<Exclude<Phase, 'home'>, number> = {
    'scan-invoice': 0, 'scan-product': 1, result: 2,
  };
  const current = idx[phase];

  return (
    <div className="flex items-center mb-6">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1 min-w-[40px]">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                style={
                  done   ? { backgroundColor: 'var(--color-verified-text)', color: '#fff' }
                  : active ? { backgroundColor: 'hsl(var(--primary))',      color: 'hsl(var(--primary-foreground))' }
                           : { backgroundColor: 'hsl(var(--muted))',         color: 'hsl(var(--muted-foreground))' }
                }
              >
                {done ? <Check className="w-4 h-4" strokeWidth={3} /> : i + 1}
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">{step.ar}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-[2px] mx-2 mb-5 rounded-full transition-all duration-500"
                style={{ backgroundColor: done ? 'var(--color-verified-text)' : 'hsl(var(--muted))' }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── Barcode chip (step 2 header) ────────────────────────── */
function BarcodeChip({ code, onReset }: { code: string; onReset: () => void }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-2xl"
      style={{
        backgroundColor: 'var(--color-verified-bg)',
        border: '0.5px solid var(--color-verified-border)',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-verified-icon-bg)' }}
        >
          <Check className="w-4 h-4" style={{ color: 'var(--color-verified-text)' }} strokeWidth={3} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">باركود الفاتورة</p>
          <p
            className="text-base font-mono font-bold truncate mt-0.5"
            style={{ color: 'var(--color-verified-text)' }}
            dir="ltr"
          >
            {code}
          </p>
        </div>
      </div>
      <button
        onClick={onReset}
        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/8 transition-colors flex-shrink-0"
        aria-label="إعادة البدء"
      >
        <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
    </div>
  );
}

/* ── Home screen ─────────────────────────────────────────── */
function HomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col flex-1 animate-fade-in">
      <div className="flex flex-col items-center text-center flex-1 justify-center gap-7">
        {/* Icon */}
        <div
          className="w-28 h-28 rounded-[2rem] flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-background-secondary)' }}
        >
          <ScanBarcode className="w-14 h-14 text-foreground" />
        </div>

        <div>
          <h2 className="text-3xl font-black">مرحباً</h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-[260px] mx-auto">
            تحقق من تطابق باركود المنتج مع الفاتورة قبل التعبئة
          </p>
        </div>

        {/* How it works */}
        <div
          className="w-full rounded-2xl p-5 text-start space-y-4"
          style={{ backgroundColor: 'var(--color-background-secondary)' }}
        >
          {[
            { n: '١', text: 'امسح باركود سطر المنتج من الفاتورة' },
            { n: '٢', text: 'امسح باركود صندوق المنتج' },
            { n: '٣', text: 'اعرف النتيجة فوراً' },
          ].map((s) => (
            <div key={s.n} className="flex items-center gap-3">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                }}
              >
                {s.n}
              </span>
              <p className="text-sm font-medium">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onStart}
        className="flex items-center justify-center gap-3 w-full min-h-[60px] rounded-2xl text-lg font-black mt-6 transition-all active:scale-95"
        style={{
          backgroundColor: 'var(--color-action-btn-bg)',
          color: 'var(--color-action-btn-text)',
        }}
      >
        <ScanBarcode className="w-6 h-6" />
        ابدأ المسح
      </button>
    </div>
  );
}

/* ── Full-screen result overlay ──────────────────────────── */
function ResultOverlay({
  invoiceBarcode,
  productBarcode,
  onDone,
}: {
  invoiceBarcode: string;
  productBarcode: string;
  onDone: () => void;
}) {
  const matched = invoiceBarcode === productBarcode;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col animate-fade-in"
      style={{
        backgroundColor: matched ? 'var(--color-verified-bg)' : 'var(--color-error-bg)',
      }}
    >
      {/* Content */}
      <div className="flex flex-col items-center justify-center flex-1 text-center gap-7 p-6">
        {/* Icon */}
        <div
          className="w-40 h-40 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: matched
              ? 'var(--color-verified-icon-bg)'
              : 'var(--color-error-icon-bg)',
          }}
        >
          {matched ? (
            <CheckCircle2 style={{ width: 80, height: 80, color: 'var(--color-verified-text)' }} />
          ) : (
            <XCircle style={{ width: 80, height: 80, color: 'var(--color-error-text)' }} />
          )}
        </div>

        {/* Title */}
        <div>
          <p
            className="text-5xl font-black leading-tight"
            style={{ color: matched ? 'var(--color-verified-text)' : 'var(--color-error-text)' }}
          >
            {matched ? 'مطابق' : 'غير مطابق'}
          </p>
          <p className="text-base text-muted-foreground mt-3 leading-relaxed">
            {matched ? 'المنتج صحيح — جاهز للتعبئة ✓' : 'المنتج لا يتطابق مع الفاتورة'}
          </p>
        </div>

        {/* Barcode detail */}
        <div
          className="w-full max-w-sm rounded-2xl p-4 text-start space-y-3"
          style={
            matched
              ? { backgroundColor: 'var(--color-verified-icon-bg)', border: '0.5px solid var(--color-verified-border)' }
              : { backgroundColor: 'var(--color-error-icon-bg)', border: '0.5px solid var(--color-error-border)' }
          }
        >
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
              باركود الفاتورة
            </p>
            <p
              className="text-sm font-mono font-bold"
              dir="ltr"
              style={{ color: matched ? 'var(--color-verified-text)' : 'var(--color-error-subtext)' }}
            >
              {invoiceBarcode}
            </p>
          </div>
          {!matched && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                باركود المنتج الممسوح
              </p>
              <p className="text-sm font-mono font-bold" dir="ltr" style={{ color: 'var(--color-error-text)' }}>
                {productBarcode}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action */}
      <div className="p-5 pb-10">
        <button
          onClick={onDone}
          className="flex items-center justify-center gap-2 w-full min-h-[58px] rounded-2xl text-base font-black transition-all active:scale-95"
          style={
            matched
              ? { backgroundColor: 'var(--color-action-btn-bg)', color: 'var(--color-action-btn-text)' }
              : { backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }
          }
        >
          <RotateCcw className="w-5 h-5" />
          {matched ? 'فحص منتج آخر' : 'إعادة المحاولة'}
        </button>
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────── */
export default function VerifyPage() {
  const [phase, setPhase] = useState<Phase>('home');
  const [invoiceBarcode, setInvoiceBarcode] = useState('');
  const [productBarcode, setProductBarcode] = useState('');
  const invoiceBarcodeRef = useRef('');

  const handleInvoiceScan = useCallback((barcode: string) => {
    setInvoiceBarcode(barcode);
    invoiceBarcodeRef.current = barcode;
    setPhase('scan-product');
  }, []);

  const handleProductScan = useCallback((barcode: string) => {
    setProductBarcode(barcode);
    setPhase('result');
    const matched = barcode === invoiceBarcodeRef.current;
    playBeep(matched ? 'success' : 'error');
    haptic(matched ? 'success' : 'error');
  }, []);

  const reset = () => {
    setPhase('home');
    setInvoiceBarcode('');
    setProductBarcode('');
    invoiceBarcodeRef.current = '';
  };

  return (
    <>
      {/* Full-screen result overlay */}
      {phase === 'result' && (
        <ResultOverlay
          invoiceBarcode={invoiceBarcode}
          productBarcode={productBarcode}
          onDone={reset}
        />
      )}

      <main className="min-h-screen p-5 max-w-md mx-auto flex flex-col">
        {/* Brand header */}
        <div className="pt-4 pb-2 flex-shrink-0">
          <h1 className="text-2xl font-black">OSSolution</h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium tracking-wide uppercase">
            فحص التعبئة
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-border my-4 flex-shrink-0" />

        {/* Home */}
        {phase === 'home' && <HomeScreen onStart={() => setPhase('scan-invoice')} />}

        {/* Step bar */}
        {phase !== 'home' && phase !== 'result' && (
          <StepBar phase={phase} />
        )}

        {/* Step 1 */}
        {phase === 'scan-invoice' && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <p className="text-2xl font-black leading-tight">امسح باركود الفاتورة</p>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                وجّه الكاميرا نحو الباركود المطبوع على سطر المنتج في الفاتورة
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-4">
              <BarcodeScanner onScan={handleInvoiceScan} />
            </div>
          </div>
        )}

        {/* Step 2 */}
        {phase === 'scan-product' && (
          <div className="space-y-5 animate-fade-in">
            <BarcodeChip code={invoiceBarcode} onReset={reset} />
            <div>
              <p className="text-2xl font-black leading-tight">امسح باركود الصندوق</p>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                وجّه الكاميرا نحو الباركود المطبوع على صندوق المنتج
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-4">
              <BarcodeScanner onScan={handleProductScan} scanDelayMs={1500} />
            </div>
          </div>
        )}
      </main>
    </>
  );
}
