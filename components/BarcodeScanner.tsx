'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Send, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const [manualValue, setManualValue] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStarting, setCameraStarting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const lastScanRef = useRef('');
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startCamera = useCallback(async () => {
    if (typeof window === 'undefined') return;
    setCameraStarting(true);
    setCameraError(null);
    try {
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      const reader = new BrowserMultiFormatReader();
      await new Promise((r) => setTimeout(r, 100));
      if (!videoRef.current) return;
      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result) => {
          if (!result) return;
          const text = result.getText();
          if (text === lastScanRef.current) return;
          lastScanRef.current = text;
          onScan(text);
          if (cooldownRef.current) clearTimeout(cooldownRef.current);
          cooldownRef.current = setTimeout(() => { lastScanRef.current = ''; }, 2000);
        }
      );
      controlsRef.current = controls;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setCameraError(msg ? `الكاميرا غير متاحة: ${msg}` : 'الكاميرا غير متاحة');
    } finally {
      setCameraStarting(false);
    }
  }, [onScan]);

  useEffect(() => {
    if (mode !== 'camera') return;
    startCamera();
    return () => {
      controlsRef.current?.stop();
      controlsRef.current = null;
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
    };
  }, [mode, startCamera]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = manualValue.trim();
    if (!val) return;
    onScan(val);
    setManualValue('');
  };

  return (
    <div className="space-y-3">
      {/* Camera viewfinder */}
      {mode === 'camera' && (
        <div className="relative h-44 bg-[#0a0a0a] rounded-xl overflow-hidden">
          {cameraError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6">
              <Camera className="w-7 h-7 text-white/30" />
              <p className="text-white/50 text-xs text-center">{cameraError}</p>
            </div>
          ) : (
            <>
              {cameraStarting && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#0a0a0a]">
                  <p className="text-white/40 text-xs">جاري تشغيل الكاميرا…</p>
                </div>
              )}
              <video
                ref={videoRef}
                className="w-full h-full object-cover opacity-90"
                muted
                playsInline
                autoPlay
                aria-hidden="true"
              />
              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-[18px] h-[18px] border-t-2 border-l-2 border-white pointer-events-none" />
              <div className="absolute top-3 right-3 w-[18px] h-[18px] border-t-2 border-r-2 border-white pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-[18px] h-[18px] border-b-2 border-l-2 border-white pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-[18px] h-[18px] border-b-2 border-r-2 border-white pointer-events-none" />
              {!cameraStarting && <div className="scan-line pointer-events-none" aria-hidden="true" />}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
                <span className="text-[10px] text-white/40">وجّه الكاميرا نحو الباركود</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex justify-center">
        <div className="flex bg-muted p-0.5 rounded-full gap-0.5">
          {([
            { key: 'camera', label: 'كاميرا' },
            { key: 'manual', label: 'يدوي' },
          ] as const).map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={cn(
                'px-5 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[34px]',
                mode === m.key
                  ? 'bg-background text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Manual input — always LTR for barcode numbers */}
      {mode === 'manual' && (
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            dir="ltr"
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
            placeholder="اكتب أو الصق الباركود…"
            autoFocus
            className="flex-1 px-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[48px] font-mono text-start"
            aria-label="إدخال الباركود"
          />
          <button
            type="submit"
            disabled={!manualValue.trim()}
            className="px-4 min-h-[48px] rounded-lg text-sm font-medium bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors flex items-center justify-center"
            aria-label="إرسال"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}
