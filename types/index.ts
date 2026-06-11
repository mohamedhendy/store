export interface InvoiceItem {
  id: string;
  sku: string;
  name: string;
  colour: string;
  size: string;
  qty: number;
  price: number;
  itemBarcode: string;
}

export interface Invoice {
  id: string;
  invoiceBarcode: string;
  customer: string;
  date: string;
  items: InvoiceItem[];
}

/** pending=0 scanned, partial=some scanned, verified=all qty scanned, error=flash only */
export type ItemStatus = 'pending' | 'partial' | 'verified' | 'error';

export interface ScanEntry {
  barcode: string;
  ts: string;
  result: 'match' | 'nomatch' | 'duplicate';
  itemId?: string;
}

export type BannerState = 'idle' | 'match' | 'nomatch' | 'duplicate';

export type ScanResult =
  | { type: 'match'; item: InvoiceItem; newCount: number }
  | { type: 'nomatch'; barcode: string }
  | { type: 'duplicate'; item: InvoiceItem };
