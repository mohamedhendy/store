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

export type ItemStatus = 'pending' | 'verified' | 'error';

export interface ScanEntry {
  barcode: string;
  ts: string;
  result: 'match' | 'nomatch' | 'duplicate';
  itemId?: string;
}

export type BannerState = 'idle' | 'match' | 'nomatch' | 'duplicate';

export type ScanResult =
  | { type: 'match'; item: InvoiceItem }
  | { type: 'nomatch'; barcode: string }
  | { type: 'duplicate'; item: InvoiceItem };
