'use client';

import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';
import { INVOICES } from '@/lib/invoiceData';
import { useStore } from '@/lib/store';

type OrderStatus = 'complete' | 'in-progress' | 'pending';

function deriveStatus(
  invoiceId: string,
  currentInvoice: ReturnType<typeof useStore.getState>['currentInvoice'],
  itemScanCounts: ReturnType<typeof useStore.getState>['itemScanCounts']
): OrderStatus {
  if (!currentInvoice || currentInvoice.id !== invoiceId) return 'pending';
  const counts = Object.values(itemScanCounts);
  if (counts.length === 0) return 'pending';
  const packedCount = currentInvoice.items.filter(
    item => (itemScanCounts[item.id] ?? 0) >= item.qty
  ).length;
  if (packedCount === currentInvoice.items.length) return 'complete';
  if (packedCount > 0) return 'in-progress';
  return 'pending';
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  complete: 'Complete',
  'in-progress': 'In progress',
  pending: 'Pending',
};

const STATUS_STYLE: Record<OrderStatus, React.CSSProperties> = {
  complete: {
    backgroundColor: 'var(--color-verified-bg)',
    color: 'var(--color-verified-text)',
  },
  'in-progress': {
    backgroundColor: 'var(--color-warning-bg)',
    color: 'var(--color-warning-text)',
  },
  pending: {},
};

export function RecentOrders() {
  const { currentInvoice, itemScanCounts } = useStore();

  return (
    <div className="space-y-2">
      {INVOICES.map((inv) => {
        const status = deriveStatus(inv.id, currentInvoice, itemScanCounts);
        const verifiedCount =
          currentInvoice?.id === inv.id
            ? currentInvoice.items.filter(item => (itemScanCounts[item.id] ?? 0) >= item.qty).length
            : 0;
        const total = inv.items.length;

        return (
          <Link
            key={inv.id}
            href={status === 'complete' ? `/complete/${inv.invoiceBarcode}` : `/verify/${inv.invoiceBarcode}`}
            className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">#{inv.id}</p>
              <p className="text-xs text-muted-foreground">
                {inv.customer} · {inv.date}
                {status === 'in-progress' && (
                  <span className="ml-1">· {verifiedCount}/{total} verified</span>
                )}
              </p>
            </div>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 bg-muted text-muted-foreground"
              style={STATUS_STYLE[status]}
            >
              {STATUS_LABEL[status]}
            </span>
            <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}
