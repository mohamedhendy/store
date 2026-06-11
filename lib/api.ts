import { Invoice } from '@/types';

/** All invoice fetching goes through here — never import invoiceData directly in pages. */
export async function fetchInvoiceByBarcode(barcode: string): Promise<Invoice | null> {
  try {
    const res = await fetch(`/api/invoices/${encodeURIComponent(barcode)}`);
    if (!res.ok) return null;
    return (await res.json()) as Invoice;
  } catch {
    return null;
  }
}
