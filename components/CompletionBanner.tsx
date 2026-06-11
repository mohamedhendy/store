import { CheckCircle2 } from 'lucide-react';

interface CompletionBannerProps {
  invoiceId: string;
  onComplete: () => void;
}

export function CompletionBanner({ invoiceId, onComplete }: CompletionBannerProps) {
  return (
    <div
      className="mt-4 rounded-lg p-6 flex flex-col items-center text-center gap-4 animate-fade-in"
      style={{
        backgroundColor: 'var(--color-verified-bg)',
        border: '0.5px solid var(--color-verified-border)',
      }}
      role="region"
      aria-label="Order complete"
    >
      <div
        className="w-[52px] h-[52px] rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-verified-icon-bg)' }}
      >
        <CheckCircle2
          style={{ width: 26, height: 26, color: 'var(--color-verified-text)' }}
        />
      </div>

      <div>
        <p
          className="text-base font-medium"
          style={{ color: 'var(--color-verified-text)' }}
        >
          All items verified!
        </p>
        <p
          className="text-[13px] mt-1"
          style={{ color: 'var(--color-verified-subtext)' }}
        >
          Order #{invoiceId} is ready to package
        </p>
      </div>

      <button
        onClick={onComplete}
        className="min-h-[48px] px-8 rounded-md text-sm font-medium transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        style={{
          backgroundColor: 'var(--color-action-btn-bg)',
          color: 'var(--color-action-btn-text)',
        }}
      >
        Complete &amp; print packing slip
      </button>
    </div>
  );
}
