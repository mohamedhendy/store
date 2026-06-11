import { create } from 'zustand';
import { Invoice, ScanEntry } from '@/types';

interface StoreState {
  currentInvoice: Invoice | null;
  /** itemId → number of times successfully scanned */
  itemScanCounts: Record<string, number>;
  /** itemId → true while the error flash is active (duplicate scan) */
  errorItems: Record<string, boolean>;
  scanHistory: ScanEntry[];

  setInvoice: (inv: Invoice) => void;
  incrementScan: (itemId: string) => void;
  setError: (itemId: string) => void;
  clearError: (itemId: string) => void;
  addScan: (entry: ScanEntry) => void;
  reset: () => void;
}

export const useStore = create<StoreState>((set) => ({
  currentInvoice: null,
  itemScanCounts: {},
  errorItems: {},
  scanHistory: [],

  setInvoice: (inv) =>
    set({
      currentInvoice: inv,
      itemScanCounts: Object.fromEntries(inv.items.map(item => [item.id, 0])),
      errorItems: {},
      scanHistory: [],
    }),

  incrementScan: (itemId) =>
    set((state) => ({
      itemScanCounts: {
        ...state.itemScanCounts,
        [itemId]: (state.itemScanCounts[itemId] ?? 0) + 1,
      },
    })),

  setError: (itemId) =>
    set((state) => ({
      errorItems: { ...state.errorItems, [itemId]: true },
    })),

  clearError: (itemId) =>
    set((state) => ({
      errorItems: { ...state.errorItems, [itemId]: false },
    })),

  addScan: (entry) =>
    set((state) => ({
      scanHistory: [entry, ...state.scanHistory],
    })),

  reset: () =>
    set({
      currentInvoice: null,
      itemScanCounts: {},
      errorItems: {},
      scanHistory: [],
    }),
}));

/** Derive display status for a single item */
export function getItemStatus(
  itemId: string,
  qty: number,
  itemScanCounts: Record<string, number>,
  errorItems: Record<string, boolean>
): import('@/types').ItemStatus {
  if (errorItems[itemId]) return 'error';
  const count = itemScanCounts[itemId] ?? 0;
  if (count === 0) return 'pending';
  if (count >= qty) return 'verified';
  return 'partial';
}
