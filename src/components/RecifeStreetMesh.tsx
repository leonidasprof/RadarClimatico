/**
 * Malha viária estilizada do Recife (representação esquemática, não cartográfica).
 * Camadas: oceano/orla → rios e ilhas → vias arteriais → vias locais.
 */
export function RecifeStreetMesh({ className = "" }: { className?: string }) {
  const local = [
    // bairros norte (Casa Amarela / Espinheiro)
    "M10 8 L44 2 M8 16 L46 9 M9 24 L44 18 M12 32 L42 27",
    "M14 2 L18 36 M22 1 L25 35 M30 2 L32 33 M38 3 L39 30",
    // centro / São José
    "M40 40 L64 36 M41 46 L66 43 M43 52 L67 50 M45 58 L66 57",
    "M46 36 L48 60 M52 35 L54 60 M58 35 L59 59 M64 35 L64 58",
    // zona sul (Boa Viagem) — quadras alongadas paralelas à orla
    "M52 66 L74 63 M53 72 L75 69 M54 78 L76 76 M55 84 L77 82 M56 90 L78 88",
    "M58 64 L62 92 M64 63 L67 91 M70 62 L72 90",
    // oeste (Várzea / Iputinga)
    "M4 44 L30 40 M5 54 L31 51 M7 64 L32 62 M9 74 L33 73",
    "M10 40 L13 76 M18 39 L20 75 M26 38 L27 74",
    // sudoeste
    "M14 82 L40 79 M16 90 L42 88 M22 80 L24 94 M32 79 L33 93",
  ];

  const arterial = [
    "M40 0 C 38 18, 42 34, 46 46 S 52 74, 54 100", // Av. Norte → Agamenon
    "M0 30 C 22 26, 44 33, 68 30 S 90 26, 100 28", // Caxangá → Conde da Boa Vista
    "M2 68 C 24 64, 46 66, 66 60 S 86 52, 100 50", // Recife → Boa Viagem (Av. Sul)
    "M70 4 C 68 26, 66 48, 64 72 S 62 90, 62 100", // Av. Boa Viagem / Domingos Ferreira
    "M18 0 C 20 24, 16 50, 22 76 S 28 92, 30 100",
  ];

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* oceano a leste */}
      <path
        d="M82 0 C 80 25, 78 50, 74 75 S 70 92, 70 100 L100 100 L100 0 Z"
        fill="var(--heat-1)"
        fillOpacity="0.06"
      />
      {/* vias locais */}
      <g
        stroke="var(--foreground)"
        strokeOpacity="0.1"
        strokeWidth="0.35"
        fill="none"
        vectorEffect="non-scaling-stroke"
      >
        {local.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      {/* vias arteriais */}
      <g
        stroke="var(--foreground)"
        strokeOpacity="0.22"
        strokeWidth="0.8"
        fill="none"
        strokeLinecap="round"
      >
        {arterial.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      {/* rios Capibaribe e Beberibe + orla */}
      <g fill="none" strokeLinecap="round">
        <path
          d="M0 20 C 20 28, 30 40, 38 52 S 50 60, 62 58"
          stroke="var(--heat-1)"
          strokeOpacity="0.4"
          strokeWidth="1.6"
        />
        <path
          d="M24 0 C 30 14, 36 30, 44 44 S 54 56, 62 58"
          stroke="var(--heat-1)"
          strokeOpacity="0.3"
          strokeWidth="1.2"
        />
        <path
          d="M62 58 C 66 56, 70 52, 72 46"
          stroke="var(--heat-1)"
          strokeOpacity="0.4"
          strokeWidth="1.8"
        />
        <path
          d="M82 0 C 80 25, 78 50, 74 75 S 70 92, 70 100"
          stroke="var(--accent)"
          strokeOpacity="0.35"
          strokeWidth="1.4"
        />
      </g>
    </svg>
  );
}
