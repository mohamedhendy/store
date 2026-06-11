'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '@/lib/store';
import { getInvoiceByBarcode } from '@/lib/invoiceData';
import { matchBarcode } from '@/lib/barcodeUtils';
import { ProgressHeader } from '@/components/ProgressHeader';
import { InvoiceTable } from '@/components/InvoiceTable';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { ResultBanner } from '@/components/ResultBanner';
import { ScanLog } from '@/components/ScanLog';
import { CompletionBanner } from '@/components/CompletionBanner';
import { Skeleton } from '@/components/ui/skeleton';
import { BannerState, InvoiceItem } from '@/types';

export default function VerifyPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceBarcode = params.invoiceBarcode as string;

  const {
    currentInvoice,
    itemStatuses,
    scanHistory,
    setInvoice,
    markVerified,
    markError,
    resetError,
    addScan,
  } = useStore();

  const [bannerState, setBannerState] = useState<BannerState>('idle');
  const [bannerItem, setBannerItem] = useState<InvoiceItem | undefined>();
  const [noMatchBarcode, setNoMatchBarcode] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (currentInvoice?.invoiceBarcode === invoiceBarcode) {
      setIsLoading(false);
      return;
    }
    const invoice = getInvoiceByBarcode(invoiceBarcode);
    if (invoice) {
      setInvoice(invoice);
      setIsLoading(false);
    } else {
      router.replace('/');
    }
  }, [invoiceBarcode]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScan = useCallback(
    (barcode: string) => {
      if (!currentInvoice) return;

      const result = matchBarcode(barcode, currentInvoice, itemStatuses);
      const ts = new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);

      if (result.type === 'match') {
        markVerified(result.item.id);
        addScan({ barcode, ts, result: 'match', itemId: result.item.id });
        setBannerState('match');
        setBannerItem(result.item);
        bannerTimerRef.current = setTimeout(() => setBannerState('idle'), 3500);
      } else if (result.type === 'nomatch') {
        addScan({ barcode, ts, result: 'nomatch' });
        setBannerState('nomatch');
        setNoMatchBarcode(barcode);
        bannerTimerRef.current = setTimeout(() => setBannerState('idle'), 3500);
      } else if (result.type === 'duplicate') {
        markError(result.item.id);
        addScan({ barcode, ts, result: 'duplicate', itemId: result.item.id });
        setBannerState('duplicate');
        setBannerItem(result.item);
        bannerTimerRef.current = setTimeout(() => setBannerState('idle'), 3500);
        // Reset item row back to verified after 2.5s
        errorTimerRef.current = setTimeout(() => resetError(result.item.id), 2500);
      }
    },
    [currentInvoice, itemStatuses, markVerified, markError, resetError, addScan]
  );

  useEffect(() => {
    return () => {
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  const verifiedCount = Object.values(itemStatuses).filter((s) => s === 'verified').length;
  const totalCount = currentInvoice?.items.length ?? 0;
  const allVerified = totalCount > 0 && verifiedCount === totalCount;

  if (isLoading || !currentInvoice) {
    return (
      <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-2 w-full mb-6" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      {/* Nav bar */}
      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/"
          className="p-2 rounded-md hover:bg-muted transition-colors flex-shrink-0"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-base font-semibold truncate">Order #{currentInvoice.id}</h1>
          <p className="text-xs text-muted-foreground">
            {currentInvoice.customer} · {currentInvoice.date}
          </p>
        </div>
      </div>

      {/* Progress header */}
      <ProgressHeader verified={verifiedCount} total={totalCount} />

      {/* Two-column layout */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Left panel — Invoice items */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-sm font-semibold">Invoice items</h2>
          </div>
          <div className="p-4 pt-2">
            <InvoiceTable items={currentInvoice.items} itemStatuses={itemStatuses} />
          </div>
        </div>

        {/* Right panel — Scan */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-sm font-semibold">Scan product box</h2>
          </div>
          <div className="p-4 space-y-3">
            <BarcodeScanner onScan={handleScan} />

            <ResultBanner
              state={bannerState}
              matchedItem={bannerItem}
              noMatchBarcode={noMatchBarcode}
            />

            <ScanLog entries={scanHistory} />
          </div>
        </div>
      </div>

      {/* Completion banner — below grid, not a modal */}
      {allVerified && (
        <CompletionBanner
          invoiceId={currentInvoice.id}
          onComplete={() => router.push(`/complete/${invoiceBarcode}`)}
        />
      )}
    </main>
  );
}
