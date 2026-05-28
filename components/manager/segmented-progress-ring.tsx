// Housekeeping Pro
// Author: [Bilal]
// Developed: May 2026
// Stack: Next.js 14 + Supabase

type SegmentedProgressRingProps = {
  percent: number;
  size?: number;
  segments?: number;
  label?: string;
};

export function SegmentedProgressRing({
  percent,
  size = 140,
  segments = 32,
  label,
}: SegmentedProgressRingProps) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const segment = circumference / segments;
  const dashArray = `${segment * 0.62} ${segment * 0.38}`;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circumference - (clamped / 100) * circumference;
  const display = Math.round(clamped);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      role="img"
      aria-label={label ?? `${display}%`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
          strokeDasharray={dashArray}
          strokeLinecap="round"
        />
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="#0d9488"
          strokeWidth={stroke}
          strokeDasharray={dashArray}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute font-bold text-2xl text-neutral-900">{display}%</span>
    </div>
  );
}
