/**
 * Small floor-plan style diagrams that make each principle visible at a glance.
 * Architectural line work rather than symbols; motion (where present) shows
 * the idea itself: chi moving along a path, a beam finding balance.
 */

const LINE = "var(--foreground)";
const SOFT = "var(--border-strong)";

function Room({ children, door = true }: { children?: React.ReactNode; door?: boolean }) {
  return (
    <>
      {/* walls, with a gap for the door on the bottom-left */}
      <path d={door ? "M44 108 H150 V12 H10 V108 H18" : "M10 108 H150 V12 H10 Z"} fill="none" stroke={LINE} strokeWidth="2" strokeLinecap="round" />
      {door && <path d="M18 108 A26 26 0 0 1 44 82" fill="none" stroke={SOFT} strokeWidth="1" strokeDasharray="2 3" />}
      {door && <line x1="18" y1="108" x2="18" y2="82" stroke={SOFT} strokeWidth="1.2" />}
      {/* window on the top wall */}
      <line x1="60" y1="12" x2="96" y2="12" stroke="var(--water)" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
      {children}
    </>
  );
}

export function CommandPositionDiagram() {
  return (
    <svg viewBox="0 0 160 120" className="h-auto w-full" role="img" aria-label="Floor plan: the bed sits against the far wall, diagonally across from the door, with a clear line of sight to it.">
      <Room>
        {/* bed against the solid wall, right of the window */}
        <rect x="104" y="16" width="36" height="46" rx="4" fill="var(--sage-soft)" stroke={LINE} strokeWidth="1.5" />
        <rect x="108" y="19" width="12" height="8" rx="2" fill="var(--surface)" stroke={LINE} strokeWidth="1" />
        <rect x="124" y="19" width="12" height="8" rx="2" fill="var(--surface)" stroke={LINE} strokeWidth="1" />
        <rect x="94" y="17" width="8" height="8" rx="1.5" fill="var(--sand)" stroke={LINE} strokeWidth="1" />
        <rect x="142" y="17" width="6" height="8" rx="1.5" fill="var(--sand)" stroke={LINE} strokeWidth="1" />
        {/* line of sight to the door */}
        <path d="M118 34 L33 97" stroke="var(--water)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-flow" />
        <circle cx="31" cy="99" r="4" fill="var(--water)" className="animate-breathe" style={{ transformOrigin: "31px 99px" }} />
      </Room>
    </svg>
  );
}

export function FlowDiagram() {
  return (
    <svg viewBox="0 0 160 120" className="h-auto w-full" role="img" aria-label="Floor plan: a gentle curved path leads from the door around the furniture to the window.">
      <Room>
        <rect x="104" y="18" width="38" height="30" rx="4" fill="var(--sage-soft)" stroke={LINE} strokeWidth="1.5" />
        <rect x="16" y="20" width="26" height="18" rx="3" fill="var(--sand)" stroke={LINE} strokeWidth="1.5" />
        <circle cx="128" cy="86" r="10" fill="var(--sand)" stroke={LINE} strokeWidth="1.5" />
        <path
          d="M31 104 C 36 80, 70 92, 78 72 S 70 40, 78 18"
          fill="none"
          stroke="var(--water)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="6 6"
          className="animate-flow"
        />
      </Room>
    </svg>
  );
}

export function BalanceDiagram() {
  return (
    <svg viewBox="0 0 160 120" className="h-auto w-full" role="img" aria-label="A beam balanced on a pivot: a large light soft shape on one side, a small dark dense shape on the other.">
      <g className="animate-sway" style={{ transformOrigin: "80px 78px" }}>
        <line x1="22" y1="78" x2="138" y2="78" stroke={LINE} strokeWidth="2" strokeLinecap="round" />
        <circle cx="42" cy="58" r="20" fill="var(--mist)" stroke={LINE} strokeWidth="1.5" />
        <rect x="112" y="62" width="16" height="16" rx="2" fill="var(--pine)" />
      </g>
      <path d="M72 100 L80 80 L88 100 Z" fill="var(--sand)" stroke={LINE} strokeWidth="1.5" strokeLinejoin="round" />
      <text x="42" y="112" textAnchor="middle" fontSize="9" fill="var(--muted-foreground)" style={{ fontFamily: "var(--font-inter)" }}>yin · soft</text>
      <text x="120" y="112" textAnchor="middle" fontSize="9" fill="var(--muted-foreground)" style={{ fontFamily: "var(--font-inter)" }}>yang · bright</text>
    </svg>
  );
}

const ELEMENTS = [
  { name: "Wood", color: "var(--el-wood)", shape: <rect x="-3.5" y="-9" width="7" height="18" rx="2" /> },
  { name: "Fire", color: "var(--el-fire)", shape: <path d="M0 -9 L8 7 L-8 7 Z" /> },
  { name: "Earth", color: "var(--el-earth)", shape: <rect x="-7" y="-7" width="14" height="14" rx="1.5" /> },
  { name: "Metal", color: "var(--el-metal)", shape: <circle r="7.5" /> },
  { name: "Water", color: "var(--el-water)", shape: <path d="M-9 0 C -5 -6, -1 6, 3 0 S 9 -4, 11 -1" fill="none" strokeWidth="3" strokeLinecap="round" /> },
];

export function ElementsDiagram() {
  const cx = 80;
  const cy = 58;
  const r = 38;
  const pts = ELEMENTS.map((_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
  return (
    <svg viewBox="0 0 160 120" className="h-auto w-full" role="img" aria-label="The five elements in their nourishing cycle: Wood, Fire, Earth, Metal and Water, each with its traditional shape.">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={SOFT} strokeWidth="1" strokeDasharray="3 5" className="animate-flow" />
      {ELEMENTS.map((el, i) => (
        <g key={el.name} transform={`translate(${pts[i].x} ${pts[i].y})`}>
          <circle r="13" fill="var(--surface)" stroke={el.color} strokeWidth="1.5" />
          <g fill={el.color} stroke={el.color}>{el.shape}</g>
          <text y={i === 0 ? -18 : 25} textAnchor="middle" fontSize="8.5" fill="var(--muted-foreground)" style={{ fontFamily: "var(--font-inter)" }}>
            {el.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function ClutterDiagram() {
  const scattered = [
    [18, 22, 10, 8], [34, 30, 7, 9], [22, 48, 12, 7], [44, 56, 8, 8], [30, 70, 9, 10], [52, 36, 8, 6], [58, 76, 10, 8], [16, 86, 11, 8], [46, 92, 7, 7],
  ];
  return (
    <svg viewBox="0 0 160 120" className="h-auto w-full" role="img" aria-label="Two small rooms side by side: one scattered with objects, one with a few pieces and open floor.">
      <rect x="8" y="12" width="66" height="96" rx="3" fill="none" stroke={LINE} strokeWidth="2" />
      {scattered.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="1.5" fill={i % 3 === 0 ? "var(--clay)" : "var(--sand)"} stroke={LINE} strokeWidth="0.8" transform={`rotate(${(i * 23) % 30 - 15} ${x + w / 2} ${y + h / 2})`} />
      ))}
      <path d="M79 60 H 86" stroke={SOFT} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M83 56 L 87 60 L 83 64" fill="none" stroke={SOFT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="92" y="12" width="60" height="96" rx="3" fill="none" stroke={LINE} strokeWidth="2" />
      <rect x="96" y="16" width="22" height="16" rx="2" fill="var(--sand)" stroke={LINE} strokeWidth="1" />
      <circle cx="142" cy="96" r="6" fill="var(--sage-soft)" stroke={LINE} strokeWidth="1" />
      <circle cx="122" cy="64" r="16" fill="var(--mist)" className="animate-breathe" style={{ transformOrigin: "122px 64px" }} />
    </svg>
  );
}
