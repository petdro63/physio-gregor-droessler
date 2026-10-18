export function Illustration({
  kind = "schulterkreisen",
  phase = 0,
  className = "",
}: {
  kind?: string;
  phase?: number;
  className?: string;
}) {
  const floor = "#d5e3d6",
    skin = "#e5b99a",
    shirt = "#477c68",
    pants = "#344e49";
  const seated = !["bruecke", "huefte-seitlich", "balance"].includes(kind);
  return (
    <svg
      className={className}
      viewBox="0 0 480 300"
      role="img"
      aria-label={`Schematische Demonstration: ${kind.replaceAll("-", " ")}, Bewegungsphase ${phase + 1}`}
    >
      <ellipse cx="250" cy="263" rx="150" ry="15" fill={floor} />
      <path d="M72 263h330" stroke="#bdd0bf" strokeWidth="2" />
      <path
        d="M355 247v-74m0 35h-35m35-19h35v58"
        fill="none"
        stroke="#9aaf99"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M375 170c-29-24-19-54-15-58 24 10 31 34 15 58m2-18c2-36 20-47 29-47 4 28-12 45-29 47"
        fill="#a7bd9e"
      />
      {kind === "bruecke" ? (
        <g>
          <rect x="90" y="244" width="260" height="10" rx="5" fill="#b3c6b1" />
          <circle cx="125" cy="225" r="17" fill={skin} />
          <path
            d={`M145 225 L230 ${phase ? 180 : 219} L283 215`}
            fill="none"
            stroke={shirt}
            strokeWidth="30"
            strokeLinecap="round"
          />
          <path
            d={`M230 ${phase ? 180 : 219} 275 185 300 242`}
            fill="none"
            stroke={pants}
            strokeWidth="20"
            strokeLinejoin="round"
          />
          <path
            d="M150 232h75"
            stroke={skin}
            strokeWidth="10"
            strokeLinecap="round"
          />
        </g>
      ) : (
        <g>
          {seated && (
            <g stroke="#a0af9a" strokeWidth="6" fill="none">
              <path d="M182 144v65h97m-90 0v49m82-49v49" />
              <path d="M182 147h-12v59" />
            </g>
          )}
          <path
            d={seated ? "M227 197h37l6 54h25" : "M225 183 212 250m28-67 25 67"}
            fill="none"
            stroke={pants}
            strokeWidth="19"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {kind === "knie-strecken" && phase > 0 ? (
            <path
              d="M234 198h34l58-15"
              fill="none"
              stroke={pants}
              strokeWidth="19"
              strokeLinecap="round"
            />
          ) : null}
          <path
            d={seated ? "M225 118v73" : "M230 108v77"}
            stroke={shirt}
            strokeWidth="47"
            strokeLinecap="round"
          />
          <path
            d={
              phase && kind === "schulterkreisen"
                ? "M204 127 178 105 171 138m77-11 26-22 7 33"
                : phase && kind === "brust-oeffnen"
                  ? "M204 125 160 132m87-7 45 7"
                  : "M204 130 191 165 227 180m20-49 16 34-29 15"
            }
            fill="none"
            stroke={shirt}
            strokeWidth="13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={
              phase && kind === "schulterkreisen"
                ? "M171 138v12m110-12v12"
                : phase && kind === "brust-oeffnen"
                  ? "M160 132h-14m146 0h14"
                  : "M227 180h8m-1 0h-8"
            }
            stroke={skin}
            strokeWidth="11"
            strokeLinecap="round"
          />
          <path d="M225 101v17" stroke={skin} strokeWidth="15" />
          <ellipse
            cx={phase && kind === "nacken-drehen" ? 230 : 225}
            cy="82"
            rx="20"
            ry="24"
            fill={skin}
          />
          <path
            d="M205 83c-7-40 39-40 40-7-15 1-23-10-30-3l-4 14Z"
            fill="#54473c"
          />
          <path
            d={seated ? "M269 254h27m-58-1h-23" : "M200 254h18m42 0h19"}
            stroke="#293e39"
            strokeWidth="9"
            strokeLinecap="round"
          />
        </g>
      )}
      <g fill="none" stroke="#6f9f72" strokeWidth="2.5" strokeLinecap="round">
        <path d="M116 99c-17 15-17 37 0 52m-2-7 3 8-9-2" />
        <path d="M319 96c16 16 16 37 0 52m1-7-3 8 9-2" />
      </g>
    </svg>
  );
}
