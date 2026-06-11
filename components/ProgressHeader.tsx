interface ProgressHeaderProps {
  verified: number;
  total: number;
}

export function ProgressHeader({ verified, total }: ProgressHeaderProps) {
  const pct = total === 0 ? 0 : Math.round((verified / total) * 100);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{verified}</span>
          {' '}of{' '}
          <span className="font-semibold text-foreground">{total}</span>
          {' '}items verified
        </span>
        <span className="text-sm font-semibold tabular-nums">{pct}%</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            backgroundColor: 'var(--color-progress-fill)',
          }}
        />
      </div>
    </div>
  );
}
