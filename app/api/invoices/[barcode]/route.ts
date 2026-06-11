import { NextResponse } from 'next/server';
import { getInvoiceByBarcode } from '@/lib/invoiceData';

/**
 * GET /api/invoices/:barcode
 *
 * Currently returns from local demo data.
 * To connect real backend, replace the body with:
 *
 *   const res = await fetch(`https://api.tasooma.com/orders/${params.barcode}`, {
 *     headers: { Authorization: `Bearer ${process.env.TASOOMA_API_KEY}` },
 *   });
 *   if (!res.ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
 *   const raw = await res.json();
 *   return NextResponse.json(mapTasoomaOrder(raw)); // shape it to Invoice type
 */
export async function GET(
  _req: Request,
  { params }: { params: { barcode: string } }
) {
  const invoice = getInvoiceByBarcode(params.barcode);
  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }
  return NextResponse.json(invoice);
}
