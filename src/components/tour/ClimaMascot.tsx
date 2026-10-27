import React from "react";

export type ClimaMascotSize = "sm" | "md" | "lg" | "xl";
export type ClimaMascotVariant = "dialog" | "fab" | "popup" | "hero";

interface ClimaMascotProps {
  size?: ClimaMascotSize;
  variant?: ClimaMascotVariant;
  isWaving?: boolean;
  className?: string;
  onClick?: () => void;
  showSpeechBubble?: boolean;
  speechText?: string;
}

const sizeMap = {
  sm: "h-12 w-12",
  md: "h-20 w-20",
  lg: "h-36 w-36",
  xl: "h-52 w-52",
};

export function ClimaMascot({
  size = "md",
  variant = "dialog",
  isWaving = true,
  className = "",
  onClick,
  showSpeechBubble = false,
  speechText,
}: ClimaMascotProps) {
  const isFab = variant === "fab";
  const dimensionClass = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center select-none overflow-visible ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      <style>{`
        @keyframes clima-wave {
          0%, 100% {
            transform: rotate(0deg);
          }
          20% {
            transform: rotate(-13deg);
          }
          40% {
            transform: rotate(15deg);
          }
          60% {
            transform: rotate(-10deg);
          }
          80% {
            transform: rotate(8deg);
          }
        }
        @keyframes clima-float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        @keyframes clima-pulse-glow {
          0%, 100% {
            filter: drop-shadow(0 0 12px rgba(14, 165, 233, 0.35));
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(14, 165, 233, 0.65));
          }
        }
        .clima-floating {
          animation: clima-float 3s ease-in-out infinite;
        }
        .clima-waving-claw {
          transform-origin: 23.75% 49.5%;
          animation: clima-wave 1.8s ease-in-out infinite;
          will-change: transform;
        }
        .clima-glow-effect {
          animation: clima-pulse-glow 3.5s ease-in-out infinite;
        }
      `}</style>

      {/* Balão de fala flutuante (opcional, para modo FAB) */}
      {showSpeechBubble && speechText && (
        <div className="absolute -top-10 right-0 whitespace-nowrap rounded-full bg-slate-900/90 text-white text-xs px-3 py-1 font-medium shadow-xl border border-sky-400/30 backdrop-blur-md animate-in fade-in zoom-in-95 pointer-events-none">
          <span className="text-sky-300 font-bold mr-1">CLIMA:</span> {speechText}
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-slate-900/90 border-r border-b border-sky-400/30 rotate-45 transform" />
        </div>
      )}

      {/* Container principal do mascote com overflow visível */}
      <div
        className={`relative ${dimensionClass} overflow-visible ${
          isFab ? "clima-floating" : ""
        } ${variant === "dialog" || variant === "hero" ? "clima-glow-effect" : ""}`}
      >
        {isWaving ? (
          // Efeito de acenar: corpo base sem a pata + pata oficial redimensionada acenando sem corte
          <div className="relative w-full h-full overflow-visible">
            {/* Imagem do corpo com o soquete da pata pronto */}
            <img
              src="/clima/clima_sem_pata.png"
              alt="Mascote CLIMA - Radar Climático"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/clima/clima_completo.png";
              }}
            />
            {/* Pata isolada oficial sobreposta com rotação da junta (sem corte no topo) */}
            <img
              src="/clima/clima_pata_animada.png"
              alt="Pata do mascote acenando"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none clima-waving-claw"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/clima/pata.png";
              }}
            />
          </div>
        ) : (
          // Imagem estática completa do mascote
          <img
            src="/clima/clima_completo.png"
            alt="Mascote CLIMA do Radar Climático"
            className="w-full h-full object-contain pointer-events-none"
          />
        )}
      </div>
    </div>
  );
}
