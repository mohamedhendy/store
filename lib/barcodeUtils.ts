import { Invoice, ScanResult } from '@/types';

export function matchBarcode(
  barcode: string,
  invoice: Invoice,
  itemStatuses: Record<string, string>
): ScanResult {
  const item = invoice.items.find(i => i.itemBarcode === barcode);

  if (!item) {
    return { type: 'nomatch', barcode };
  }

  if (itemStatuses[item.id] === 'verified') {
    return { type: 'duplicate', item };
  }

  return { type: 'match', item };
}
