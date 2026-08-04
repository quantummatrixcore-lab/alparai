const W = 260;
const H = 80;
const PAD = 4;

export function ScoreHistoryChart({
  score,
  lower,
  upper,
}: {
  score: number;
  lower: number;
  upper: number;
}) {
  const cx = W / 2;
  const cy = H - PAD;
  const r = Math.min(W, H) / 2 - PAD;

  const scoreAngle = Math.PI * (1 - Math.min(Math.max(score, 0), 1));
  const lowerAngle = Math.PI * (1 - Math.min(Math.max(lower, 0), 1));
  const upperAngle = Math.PI * (1 - Math.min(Math.max(upper, 0), 1));

  const px = (a: number) => cx + r * Math.sin(a);
  const py = (a: number) => cy - r * Math.cos(a);

  const color = score > 0.7 ? "#22c55e" : score > 0.4 ? "#eab308" : "#ef4444";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-20 w-full"
      role="img"
      aria-label={`Score: ${Math.round(score * 100)}`}
    >
      <path
        d={`M${PAD},${cy} A${r},${r} 0 0,1 ${W - PAD},${cy}`}
        fill="none"
        stroke="#333"
        strokeWidth={2}
      />
      <path
        d={`M${px(lowerAngle)},${py(lowerAngle)} A${r},${r} 0 0,1 ${px(upperAngle)},${py(upperAngle)}`}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeOpacity={0.3}
      />
      <circle cx={px(scoreAngle)} cy={py(scoreAngle)} r={4} fill={color} />
      <line
        x1={px(scoreAngle)}
        y1={py(scoreAngle) - 8}
        x2={px(scoreAngle)}
        y2={py(scoreAngle) + 8}
        stroke={color}
        strokeWidth={2}
      />
    </svg>
  );
}
