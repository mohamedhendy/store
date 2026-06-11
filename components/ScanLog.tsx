import { ScanEntry } from '@/types';

interface ScanLogProps {
  entries: ScanEntry[];
}

const DOT_STYLE: Record<ScanEntry['result'], string> = {
  match: 'var(--color-verified-text)',
  nomatch: 'var(--color-error-text)',
  duplicate: 'var(--color-warning-text)',
};

export function ScanLog({ entries }: ScanLogProps) {
  const recent = entries.slice(0, 5);

  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 font-medium">
        Scan log
      </p>
      {recent.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No scans yet</p>
      ) : (
        <div className="space-y-1.5">
          {recent.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: DOT_STYLE[entry.result] }}
              />
              <span className="text-xs font-mono flex-1 truncate text-foreground">
                {entry.barcode}
              </span>
              <span className="text-xs text-muted-foreground flex-shrink-0 tabular-nums">
                {entry.ts}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
