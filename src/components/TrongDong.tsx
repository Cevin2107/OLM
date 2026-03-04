/**
 * TrongDong – họa tiết mặt trống đồng Đông Sơn dạng SVG trang trí.
 * Stroke-only, không fill, để dùng làm nền chìm.
 */
export function TrongDong({ size = 600, className = '' }: { size?: number; className?: string }) {
  const cx = size / 2;
  const cy = size / 2;

  // Helper: tọa độ điểm trên đường tròn
  const pt = (r: number, angleDeg: number) => {
    const a = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  // Helper: tạo polygon
  // (dùng nội bộ trong starPoints và diamondRing)

  // ── Ngôi sao 14 cánh ở giữa ──
  const starPoints = () => {
    const n = 14;
    const outer = size * 0.068;
    const inner = size * 0.035;
    const pts: string[] = [];
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const angle = (i * 360) / (n * 2);
      const p = pt(r, angle);
      pts.push(`${p.x},${p.y}`);
    }
    return pts.join(' ');
  };

  // ── Vành tam giác răng cưa (vành 2) ──
  const zigzagRing = (rInner: number, rOuter: number, n: number) => {
    const paths: string[] = [];
    for (let i = 0; i < n; i++) {
      const a1 = (i * 360) / n;
      const a2 = ((i + 0.5) * 360) / n;
      const a3 = ((i + 1) * 360) / n;
      const p1 = pt(rInner, a1);
      const p2 = pt(rOuter, a2);
      const p3 = pt(rInner, a3);
      paths.push(`M${p1.x},${p1.y} L${p2.x},${p2.y} L${p3.x},${p3.y}`);
    }
    return paths;
  };

  // ── Chim Lạc đơn giản hoá ──
  const lachBird = (r: number, angleDeg: number, scale: number) => {
    const center = pt(r, angleDeg);
    const rot = angleDeg; // quay theo hướng bay
    // body + wings dạng SVG path nhỏ, sẽ transform về vị trí
    return (
      <g
        key={`bird-${angleDeg}`}
        transform={`translate(${center.x},${center.y}) rotate(${rot})`}
      >
        {/* thân */}
        <ellipse rx={scale * 0.5} ry={scale * 0.18} fill="currentColor" />
        {/* đầu */}
        <ellipse cx={scale * 0.52} cy={-scale * 0.08} rx={scale * 0.16} ry={scale * 0.14} fill="currentColor" />
        {/* mỏ */}
        <polygon points={`${scale * 0.68},${-scale * 0.06} ${scale * 0.88},${-scale * 0.03} ${scale * 0.68},${scale * 0.02}`} fill="currentColor" />
        {/* cánh trên */}
        <path d={`M${-scale * 0.3},0 Q0,${-scale * 0.5} ${scale * 0.3},${-scale * 0.12}`} stroke="currentColor" strokeWidth={scale * 0.1} fill="none" />
        {/* chân dài */}
        <line x1={scale * 0.1} y1={scale * 0.18} x2={scale * 0.1} y2={scale * 0.55} stroke="currentColor" strokeWidth={scale * 0.07} />
        <line x1={scale * 0.1} y1={scale * 0.55} x2={-scale * 0.05} y2={scale * 0.68} stroke="currentColor" strokeWidth={scale * 0.06} />
        <line x1={scale * 0.1} y1={scale * 0.55} x2={scale * 0.25} y2={scale * 0.68} stroke="currentColor" strokeWidth={scale * 0.06} />
        <line x1={-scale * 0.05} y1={scale * 0.18} x2={-scale * 0.05} y2={scale * 0.52} stroke="currentColor" strokeWidth={scale * 0.07} />
        <line x1={-scale * 0.05} y1={scale * 0.52} x2={-scale * 0.18} y2={scale * 0.63} stroke="currentColor" strokeWidth={scale * 0.06} />
        <line x1={-scale * 0.05} y1={scale * 0.52} x2={scale * 0.1} y2={scale * 0.63} stroke="currentColor" strokeWidth={scale * 0.06} />
        {/* đuôi cong */}
        <path d={`M${-scale * 0.5},0 Q${-scale * 0.7},${-scale * 0.3} ${-scale * 0.6},${-scale * 0.5}`} stroke="currentColor" strokeWidth={scale * 0.08} fill="none" />
      </g>
    );
  };

  // ── Hoa văn hình thoi (vành 4) ──
  const diamondRing = (r: number, n: number, w: number, h: number) =>
    Array.from({ length: n }, (_, i) => {
      const center = pt(r, (i * 360) / n);
      const rot = (i * 360) / n;
      return (
        <g key={`diamond-${i}`} transform={`translate(${center.x},${center.y}) rotate(${rot})`}>
          <polygon points={`0,${-h} ${w},0 0,${h} ${-w},0`} fill="currentColor" />
        </g>
      );
    });

  // ── Chấm tròn (vành 3 & 5) ──
  const dotRing = (r: number, n: number, dotR: number) =>
    Array.from({ length: n }, (_, i) => {
      const p = pt(r, (i * 360) / n);
      return <circle key={i} cx={p.x} cy={p.y} r={dotR} fill="currentColor" />;
    });

  // ── Vành nét kép ──
  const doubleCircle = (r: number, gap: number) => (
    <>
      <circle cx={cx} cy={cy} r={r - gap / 2} />
      <circle cx={cx} cy={cy} r={r + gap / 2} />
    </>
  );

  const R = size / 2; // bán kính ngoài cùng

  const birdRadius = R * 0.52;
  const birdCount = 10;
  const birdScale = size * 0.028;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        fill="currentColor"
        stroke="none"
      >
        {/* ══ Ngôi sao trung tâm ══ */}
        <polygon points={starPoints()} />

        {/* ══ Vành 1 – vòng tròn kép quanh sao ══ */}
        <g fill="none" stroke="currentColor" strokeWidth={size * 0.006}>
          {doubleCircle(R * 0.135, size * 0.012)}
        </g>

        {/* ══ Vành 2 – tam giác răng cưa (ngoài vành 1) ══ */}
        <g stroke="currentColor" strokeWidth={size * 0.004} fill="none">
          {zigzagRing(R * 0.16, R * 0.21, 24).map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {/* ══ Vành 3 – vòng chấm ══ */}
        {dotRing(R * 0.265, 32, size * 0.008)}

        {/* ══ Vành 4 – hoa văn hình thoi ══ */}
        {diamondRing(R * 0.33, 20, size * 0.018, size * 0.026)}

        {/* ══ Vành 5 – vòng chấm ══ */}
        {dotRing(R * 0.395, 36, size * 0.007)}

        {/* ══ Vành 6 – nét kép ══ */}
        <g fill="none" stroke="currentColor" strokeWidth={size * 0.005}>
          {doubleCircle(R * 0.43, size * 0.01)}
        </g>

        {/* ══ Vành 7 – chim Lạc ══ */}
        {Array.from({ length: birdCount }, (_, i) =>
          lachBird(birdRadius, (i * 360) / birdCount, birdScale)
        )}

        {/* ══ Vành 8 – nét kép ngoài vành chim ══ */}
        <g fill="none" stroke="currentColor" strokeWidth={size * 0.005}>
          {doubleCircle(R * 0.62, size * 0.01)}
        </g>

        {/* ══ Vành 9 – tam giác răng cưa ngoài ══ */}
        <g stroke="currentColor" strokeWidth={size * 0.004} fill="none">
          {zigzagRing(R * 0.65, R * 0.7, 32).map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {/* ══ Vành 10 – chấm ══ */}
        {dotRing(R * 0.75, 48, size * 0.006)}

        {/* ══ Vành 11 – hình thoi nhỏ ══ */}
        {diamondRing(R * 0.82, 28, size * 0.013, size * 0.018)}

        {/* ══ Vành 12 – chấm ngoài cùng ══ */}
        {dotRing(R * 0.88, 56, size * 0.005)}

        {/* ══ Vòng ngoài cùng kép ══ */}
        <g fill="none" stroke="currentColor" strokeWidth={size * 0.006}>
          {doubleCircle(R * 0.94, size * 0.011)}
        </g>
      </g>
    </svg>
  );
}
