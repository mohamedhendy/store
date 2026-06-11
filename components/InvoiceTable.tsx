import { CircleDashed, Check, X, Clock } from 'lucide-react';
import { InvoiceItem, ItemStatus } from '@/types';

function StatusIcon({ status }: { status: ItemStatus }) {
  if (status === 'verified') {
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: 'var(--color-verified-bg)' }}
      >
        <Check className="w-4 h-4" style={{ color: 'var(--color-verified-text)' }} strokeWidth={2.5} />
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: 'var(--color-error-bg)' }}
      >
        <X className="w-4 h-4" style={{ color: 'var(--color-error-text)' }} strokeWidth={2.5} />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
      <CircleDashed className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}

function StatusBadge({ status }: { status: ItemStatus }) {
  if (status === 'verified') {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
        style={{
          backgroundColor: 'var(--color-verified-bg)',
          color: 'var(--color-verified-text)',
        }}
      >
        <Check className="w-3 h-3" strokeWidth={2.5} />
        Verified
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
        style={{
          backgroundColor: 'var(--color-error-bg)',
          color: 'var(--color-error-text)',
        }}
      >
        <X className="w-3 h-3" strokeWidth={2.5} />
        Error
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 bg-muted text-muted-foreground">
      <Clock className="w-3 h-3" />
      Pending
    </span>
  );
}

interface InvoiceTableProps {
  items: InvoiceItem[];
  itemStatuses: Record<string, ItemStatus>;
}

export function InvoiceTable({ items, itemStatuses }: InvoiceTableProps) {
  return (
    <div className="divide-y divide-border">
      {items.map((item) => {
        const status: ItemStatus = (itemStatuses[item.id] as ItemStatus) ?? 'pending';
        return (
          <div
            key={item.id}
            className="flex items-center gap-3 py-3 px-1"
            style={{
              backgroundColor:
                status === 'verified'
                  ? 'var(--color-verified-bg)'
                  : status === 'error'
                  ? 'var(--color-error-bg)'
                  : 'var(--color-background-primary)',
              transition: 'background-color 350ms ease',
            }}
          >
            <StatusIcon status={status} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium leading-tight truncate">{item.name}</p>
              <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                {item.colour} · {item.size} · ×{item.qty}
              </p>
            </div>
            <StatusBadge status={status} />
          </div>
        );
      })}
    </div>
  );
}
