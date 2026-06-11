# Pack Verify — TASOOMA

Warehouse order-verification tool for TASOOMA retail shoe store.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Flow

1. `/` — Dashboard. Click **New Order**.
2. `/scan-invoice` — Scan the invoice-level barcode (or type it manually).
3. `/verify/[invoiceBarcode]` — Scan each product box barcode to verify items.
4. `/complete/[invoiceBarcode]` — Summary + print packing slip.

## Test barcodes

| Barcode | Purpose |
|---|---|
| `255258722` | Invoice #255258722 — Ali Madkhali |
| `1000000000005718` | P3 Comfortable Sandal — NAVY NU · 45 |
| `1000000000005720` | P3 Comfortable Sandal — BROWN · 42 |
| `1000000000005722` | Classic Slip-on — BLACK · 43 |

Scan invoice barcode first, then scan each box barcode in any order.

## Stack

- **Next.js 14** App Router + TypeScript strict
- **Tailwind CSS v3** + dark mode via `.dark` class
- **Zustand** — client state (invoice + item statuses + scan log)
- **@zxing/browser** — camera barcode scanning (auto-fallback to manual)
- **lucide-react** — icons
- All UI primitives written inline (no shadcn CLI required)

## Dark mode

Toggle by adding/removing the `dark` class on `<html>`. All state colors (green/red/amber) have dark-mode CSS variable equivalents defined in `app/globals.css`.
