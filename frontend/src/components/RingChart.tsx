export default function RingChart({ pct, color, size = 80, stroke = 8, showLabel = true }: {
  pct: number; color: string; size?: number; stroke?: number; showLabel?: boolean;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg4)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`} style={{ transition: 'stroke-dasharray .8s cubic-bezier(.4,0,.2,1)' }} />
      {showLabel && (
        <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
          fill="var(--text)" fontSize={size/5} fontWeight="800" fontFamily="Poppins"
          transform={`rotate(90 ${size/2} ${size/2})`}>{pct}%</text>
      )}
    </svg>
  );
}
