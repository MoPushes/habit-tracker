export default function BarChart({ data, color }: { data: { l: string; v: number }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.v), 1);
  const W = 260, H = 90, bw = 24;
  const gap = (W - data.length * bw) / (data.length + 1);
  return (
    <svg width={W} height={H + 18} overflow="visible">
      {data.map((d, i) => {
        const bh = Math.max(4, (d.v / max) * H);
        const x = gap + i * (bw + gap);
        const y = H - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx={6} fill={color}
              opacity={i === data.length - 1 ? 1 : 0.55}
              style={{ transition: 'y .6s cubic-bezier(.4,0,.2,1),height .6s cubic-bezier(.4,0,.2,1)' }} />
            <text x={x + bw/2} y={H+13} textAnchor="middle" fill="var(--text3)" fontSize="10" fontFamily="Poppins" fontWeight="600">{d.l}</text>
          </g>
        );
      })}
    </svg>
  );
}
