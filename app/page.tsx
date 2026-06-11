import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
      {/* Brand header */}
      <div className="mb-8 pt-4">
        <h1 className="text-2xl font-bold tracking-tight">OSSolution</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Pack Verify</p>
      </div>

      {/* New order CTA */}
      <Link
        href="/scan-invoice"
        className="flex items-center justify-center gap-2 w-full min-h-[48px] rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-4 h-4" />
        New Order
      </Link>
    </main>
  );
}
