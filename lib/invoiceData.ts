import { Invoice } from '@/types';

export const INVOICES: Invoice[] = [
  {
    id: '255258722',
    invoiceBarcode: '255258722',
    customer: 'Ali Madkhali',
    date: '21 Apr 2026',
    items: [
      {
        id: '0',
        sku: '25001',
        name: 'P3 Comfortable Sandal',
        colour: 'NAVY NU',
        size: '45',
        qty: 1,
        price: 149.40,
        itemBarcode: '1000000000006718',
      },
      {
        id: '1',
        sku: '25001',
        name: 'P3 Comfortable Sandal',
        colour: 'NAVY MAT',
        size: '45',
        qty: 1,
        price: 149.40,
        itemBarcode: '1000000000006746',
      },
    ],
  },
];

export function getInvoiceByBarcode(barcode: string): Invoice | null {
  return INVOICES.find(inv => inv.invoiceBarcode === barcode) ?? null;
}
