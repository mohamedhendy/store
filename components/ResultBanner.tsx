import { ScanLine, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { BannerState, InvoiceItem } from '@/types';

interface ResultBannerProps {
  state: BannerState;
  matchedItem?: InvoiceItem;
  noMatchBarcode?: string;
}

export function ResultBanner({ state, matchedItem, noMatchBarcode }: ResultBannerProps) {
  if (state === 'idle') {
    return (
      <div
        className="flex items-center gap-3 p-3 rounded-lg"
        style={{ backgroundColor: 'var(--color-background-secondary)' }}
        aria-live="assertive"
        aria-atomic="true"
        role="status"
      >
        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-muted flex-shrink-0">
          <ScanLine className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Ready to scan</p>
          <p className="text-xs text-muted-foreground">Point camera or enter barcode manually</p>
        </div>
      </div>
    );
  }

  if (state === 'match' && matchedItem) {
    return (
      <div
        className="flex items-center gap-3 p-3 rounded-lg animate-slide-in"
        style={{
          backgroundColor: 'var(--color-verified-bg)',
          border: '0.5px solid var(--color-verified-border)',
        }}
        aria-live="assertive"
        aria-atomic="true"
        role="status"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--color-verified-icon-bg)' }}
        >
          <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-verified-text)' }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium" style={{ color: 'var(--color-verified-text)' }}>
            Match confirmed
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--color-verified-subtext)' }}>
            {matchedItem.name} — {matchedItem.colour} · {matchedItem.size} verified
          </p>
        </div>
      </div>
    );
  }

  if (state === 'nomatch') {
    return (
      <div
        className="flex items-center gap-3 p-3 rounded-lg animate-slide-in"
        style={{
          backgroundColor: 'var(--color-error-bg)',
          border: '0.5px solid var(--color-error-border)',
        }}
        aria-live="assertive"
        aria-atomic="true"
        role="alert"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--color-error-icon-bg)' }}
        >
          <XCircle className="w-4 h-4" style={{ color: 'var(--color-error-text)' }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium" style={{ color: 'var(--color-error-text)' }}>
            No match found
          </p>
          <p className="text-xs font-mono truncate" style={{ color: 'var(--color-error-subtext)' }}>
            Barcode {noMatchBarcode} is not in this order
          </p>
        </div>
      </div>
    );
  }

  if (state === 'duplicate' && matchedItem) {
    return (
      <div
        className="flex items-center gap-3 p-3 rounded-lg animate-slide-in"
        style={{
          backgroundColor: 'var(--color-warning-bg)',
          border: '0.5px solid var(--color-warning-border)',
        }}
        aria-live="assertive"
        aria-atomic="true"
        role="alert"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--color-warning-icon-bg)' }}
        >
          <AlertTriangle className="w-4 h-4" style={{ color: 'var(--color-warning-text)' }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium" style={{ color: 'var(--color-warning-text)' }}>
            Already scanned
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--color-warning-subtext)' }}>
            {matchedItem.name} was already verified
          </p>
        </div>
      </div>
    );
  }

  return null;
}
