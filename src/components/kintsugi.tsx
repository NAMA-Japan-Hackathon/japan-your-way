// Small, code-drawn ceramic seams. They occupy the margins, never intercept a control.
const fractures = [
  [
    "M0 8L17 28L10 47L31 66L23 93L47 115L36 144L58 168L49 193L65 218",
    "M10 47L1 62L5 79",
    "M31 66L49 59L61 71",
    "M36 144L18 154L23 171",
    "M49 193L31 206L26 220",
  ],
  [
    "M0 18L24 40L17 64L42 88L31 117L50 139L43 165L61 187L55 219",
    "M24 40L41 32L47 15",
    "M17 64L3 81L8 94",
    "M31 117L13 129L18 148",
    "M43 165L25 179L29 196",
  ],
  [
    "M0 1L13 26L7 49L28 70L19 102L40 122L33 151L54 176L45 201L59 220",
    "M28 70L48 64L61 76",
    "M19 102L2 112L5 130",
    "M33 151L15 163L19 178",
    "M54 176L65 163",
  ],
];
export function Kintsugi({
  right = false,
  variant = 0,
  position = "",
}: {
  right?: boolean;
  variant?: number;
  position?: string;
}) {
  const paths = fractures[variant % fractures.length];
  return (
    <svg
      className={`kintsugi-seam ${right ? "right" : ""} ${position}`}
      viewBox="0 0 66 220"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="none"
    >
      <g className="crack-bed">
        {paths.map((d) => (
          <path d={d} key={d} />
        ))}
      </g>
      <g className="gold-fill">
        {paths.map((d) => (
          <path
            d={d}
            key={d}
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset="0"
          />
        ))}
      </g>
    </svg>
  );
}
