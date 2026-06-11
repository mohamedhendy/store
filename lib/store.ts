import { create } from 'zustand';
import { Invoice, ItemStatus, ScanEntry } from '@/types';

interface StoreState {
  currentInvoice: Invoice | null;
  itemStatuses: Record<string, ItemStatus>;
  scanHistory: ScanEntry[];
  setInvoice: (inv: Invoice) => void;
  markVerified: (itemId: string) => void;
  markError: (itemId: string) => void;
  resetError: (itemId: string) => void;
  addScan: (entry: ScanEntry) => void;
  reset: () => void;
}

export const useStore = create<StoreState>((set) => ({
  currentInvoice: null,
  itemStatuses: {},
  scanHistory: [],

  setInvoice: (inv) =>
    set({
      currentInvoice: inv,
      itemStatuses: Object.fromEntries(
        inv.items.map(item => [item.id, 'pending' as ItemStatus])
      ),
      scanHistory: [],
    }),

  markVerified: (itemId) =>
    set((state) => ({
      itemStatuses: { ...state.itemStatuses, [itemId]: 'verified' },
    })),

  markError: (itemId) =>
    set((state) => ({
      itemStatuses: { ...state.itemStatuses, [itemId]: 'error' },
    })),

  resetError: (itemId) =>
    set((state) => ({
      itemStatuses: { ...state.itemStatuses, [itemId]: 'verified' },
    })),

  addScan: (entry) =>
    set((state) => ({
      scanHistory: [entry, ...state.scanHistory],
    })),

  reset: () =>
    set({
      currentInvoice: null,
      itemStatuses: {},
      scanHistory: [],
    }),
}));
