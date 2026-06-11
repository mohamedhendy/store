import { Invoice, ScanResult } from '@/types';

export function matchBarcode(
  barcode: string,
  invoice: Invoice,
  itemScanCounts: Record<string, number>
): ScanResult {
  const item = invoice.items.find(i => i.itemBarcode === barcode);

  if (!item) {
    return { type: 'nomatch', barcode };
  }

  const scanned = itemScanCounts[item.id] ?? 0;

  if (scanned >= item.qty) {
    return { type: 'duplicate', item };
  }

  return { type: 'match', item, newCount: scanned + 1 };
}
