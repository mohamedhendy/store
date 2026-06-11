'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Send, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  /** Ignore camera results for this many ms after mount (prevents double-scan on phase transition) */
  scanDelayMs?: number;
}

export function BarcodeScanner({ onScan, scanDelayMs = 0 }: BarcodeScannerProps) {
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const [manualValue, setManualValue] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [isReady, setIsReady] = useState(scanDelayMs === 0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const lastScanRef = useRef('');
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readyRef = useRef(scanDelayMs === 0);

  // Gate camera for scanDelayMs ms — show "preparing" UI
  useEffect(() => {
    if (scanDelayMs === 0) return;
    readyRef.current = false;
    setIsReady(false);
    const t = setTimeout(() => {
      readyRef.current = true;
      setIsReady(true);
    }, scanDelayMs);
    return () => clearTimeout(t);
  }, [scanDelayMs]);

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
          if (!result || !readyRef.current) return;
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
    <div className="space-y-4">
      {/* Camera viewfinder */}
      {mode === 'camera' && (
        <div
          className="relative bg-[#0a0a0a] rounded-2xl overflow-hidden"
          style={{ height: '260px' }}
        >
          {cameraError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6">
              <div className="w-14 h-14 rounded-full bg-white/8 flex items-center justify-center">
                <Camera className="w-7 h-7 text-white/30" />
              </div>
              <p className="text-white/40 text-sm text-center leading-relaxed">{cameraError}</p>
            </div>
          ) : (
            <>
              {/* Video feed */}
              {cameraStarting && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 bg-[#0a0a0a]">
                  <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                  <p className="text-white/40 text-xs">جاري تشغيل الكاميرا…</p>
                </div>
              )}

              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
                autoPlay
                aria-hidden="true"
              />

              {/* Vignette edges — focus attention on center */}
              <div className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to right, rgba(0,0,0,0.35) 0%, transparent 18%, transparent 82%, rgba(0,0,0,0.35) 100%)',
                }}
              />
              <div className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 22%, transparent 78%, rgba(0,0,0,0.5) 100%)',
                }}
              />

              {/* Corner brackets */}
              {(['top-4 left-4', 'top-4 right-4', 'bottom-4 left-4', 'bottom-4 right-4'] as const).map((pos, i) => (
                <div
                  key={i}
                  className={`absolute w-6 h-6 pointer-events-none ${pos} ${
                    i === 0 ? 'border-t-[3px] border-l-[3px]'
                    : i === 1 ? 'border-t-[3px] border-r-[3px]'
                    : i === 2 ? 'border-b-[3px] border-l-[3px]'
                    : 'border-b-[3px] border-r-[3px]'
                  } border-white rounded-[2px]`}
                />
              ))}

              {/* Scanning line — only when ready */}
              {!cameraStarting && isReady && (
                <div className="scan-line pointer-events-none" aria-hidden="true" />
              )}

              {/* Status label at bottom */}
              {!cameraStarting && (
                <div className="absolute bottom-0 left-0 right-0 py-3 flex flex-col items-center gap-1.5 pointer-events-none">
                  {!isReady ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/50 animate-spin" />
                      <span className="text-[11px] text-white/50">جاري الاستعداد…</span>
                    </>
                  ) : (
                    <span className="text-[11px] text-white/50">وجّه الكاميرا نحو الباركود</span>
                  )}
                </div>
              )}
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
                'px-6 py-1.5 rounded-full text-sm font-medium transition-all duration-200 min-h-[38px]',
                mode === m.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Manual input */}
      {mode === 'manual' && (
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            dir="ltr"
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
            placeholder="اكتب أو الصق الباركود…"
            autoFocus
            className="flex-1 px-4 py-3 text-sm border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[52px] font-mono text-start"
            aria-label="إدخال الباركود"
          />
          <button
            type="submit"
            disabled={!manualValue.trim()}
            className="px-5 min-h-[52px] rounded-xl text-sm font-bold bg-primary text-primary-foreground disabled:opacity-30 hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center"
            aria-label="إرسال"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}
