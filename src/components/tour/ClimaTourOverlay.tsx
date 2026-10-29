import React, { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTour } from "@/context/TourContext";
import { CLIMA_TOUR_STEPS, type TourStep } from "@/constants/tourStepsData";
import { ClimaMascot } from "./ClimaMascot";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Compass,
  Volume2,
  VolumeX,
  Sparkles,
  Layers,
  Thermometer,
  Trees,
  AlertTriangle,
  Radio,
  Check,
  Satellite,
  Activity,
  FileSpreadsheet,
  ArrowLeftRight,
  HeartPulse,
} from "lucide-react";

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function ClimaTourOverlay() {
  const {
    tourState,
    activeStepIndex,
    currentStep,
    totalSteps,
    isAudioEnabled,
    isMenuOpen,
    setIsMenuOpen,
    acceptTour,
    declineTour,
    nextStep,
    prevStep,
    goToStep,
    closeTour,
    openTourFromDock,
    toggleAudio,
    playClick,
  } = useTour();

  const [mounted, setMounted] = useState(false);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number }>({ top: 100, left: 100 });
  const [menuTab, setMenuTab] = useState<"geral" | "subfeatures">("geral");

  // Garante execução apenas no client-side para o Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Busca e calcula a posição do elemento com data-tour
  const updateTargetRect = useCallback(() => {
    if (tourState !== "touring" || !currentStep || isMenuOpen) {
      setTargetRect(null);
      return;
    }

    const targetEl = document.querySelector(`[data-tour="${currentStep.targetTourId}"]`);
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      const padding = 8;
      const calculatedRect: TargetRect = {
        top: Math.max(0, rect.top - padding),
        left: Math.max(0, rect.left - padding),
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      };
      setTargetRect(calculatedRect);

      // Posicionamento inteligente e responsivo do Pop-up Laranja
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const popupWidth = Math.min(380, windowWidth - 24);
      const popupHeight = 280;

      let top = 0;
      let left = 0;

      const pref = currentStep.positionPreference;

      if (pref === "bottom" || pref === "center") {
        if (calculatedRect.top + calculatedRect.height + popupHeight + 16 < windowHeight) {
          top = calculatedRect.top + calculatedRect.height + 14;
          left = calculatedRect.left + calculatedRect.width / 2 - popupWidth / 2;
        } else {
          top = Math.max(12, calculatedRect.top - popupHeight - 14);
          left = calculatedRect.left + calculatedRect.width / 2 - popupWidth / 2;
        }
      } else if (pref === "top") {
        if (calculatedRect.top - popupHeight - 16 > 0) {
          top = calculatedRect.top - popupHeight - 14;
          left = calculatedRect.left + calculatedRect.width / 2 - popupWidth / 2;
        } else {
          top = calculatedRect.top + calculatedRect.height + 14;
          left = calculatedRect.left + calculatedRect.width / 2 - popupWidth / 2;
        }
      } else if (pref === "left") {
        if (calculatedRect.left - popupWidth - 16 > 0) {
          left = calculatedRect.left - popupWidth - 14;
          top = calculatedRect.top + 20;
        } else {
          left = Math.min(windowWidth - popupWidth - 12, calculatedRect.left + calculatedRect.width + 14);
          top = calculatedRect.top + 20;
        }
      } else if (pref === "right") {
        if (calculatedRect.left + calculatedRect.width + popupWidth + 16 < windowWidth) {
          left = calculatedRect.left + calculatedRect.width + 14;
          top = calculatedRect.top + 20;
        } else {
          left = Math.max(12, calculatedRect.left - popupWidth - 14);
          top = calculatedRect.top + 20;
        }
      }

      left = Math.max(12, Math.min(windowWidth - popupWidth - 12, left));
      top = Math.max(12, Math.min(windowHeight - popupHeight - 12, top));

      setPopupPos({ top, left });
    } else {
      setTargetRect(null);
    }
  }, [tourState, currentStep, isMenuOpen]);

  // Scroll automático suave para o elemento
  useEffect(() => {
    if (tourState === "touring" && currentStep && !isMenuOpen) {
      const targetEl = document.querySelector(`[data-tour="${currentStep.targetTourId}"]`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }
    }
  }, [tourState, currentStep, isMenuOpen]);

  // Resiliência de Layout: ResizeObserver + scroll/resize listeners
  useEffect(() => {
    if (tourState !== "touring" || !currentStep || isMenuOpen) return;

    updateTargetRect();

    const targetEl = document.querySelector(`[data-tour="${currentStep.targetTourId}"]`);
    let resizeObserver: ResizeObserver | null = null;

    if (targetEl && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        updateTargetRect();
      });
      resizeObserver.observe(targetEl);
      resizeObserver.observe(document.body);
    }

    const handleScrollOrResize = () => {
      updateTargetRect();
    };

    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [tourState, currentStep, isMenuOpen, updateTargetRect]);

  if (!mounted) return null;

  // ESTADO ANCORADO (Docked): Floating Action Button (FAB)
  if (tourState === "docked") {
    return createPortal(
      <div className="fixed bottom-6 right-6 z-[9990] flex items-center gap-3">
        <div
          onClick={openTourFromDock}
          className="hidden md:flex items-center gap-2 rounded-full border border-sky-400/40 bg-slate-900/90 py-1.5 px-3.5 text-xs text-white shadow-xl backdrop-blur-md cursor-pointer hover:bg-slate-800 transition-all group"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-sky-200 group-hover:text-white transition-colors">
            Falar com o CLIMA
          </span>
          <Compass className="h-3.5 w-3.5 text-amber-400 shrink-0 ml-0.5 group-hover:rotate-45 transition-transform" />
        </div>

        <button
          onClick={openTourFromDock}
          type="button"
          aria-label="Abrir tour com o CLIMA"
          className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 p-1 shadow-2xl ring-4 ring-sky-400/30 transition-all duration-300 hover:scale-110 hover:ring-sky-400/60 active:scale-95 cursor-pointer focus:outline-none overflow-visible"
        >
          <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-md animate-pulse" />
          <ClimaMascot size="sm" variant="fab" isWaving={true} />
        </button>
      </div>,
      document.body
    );
  }

  // ESTADO DE CONVITE (Asking): Modal Central com o CLIMA
  if (tourState === "asking") {
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-[5px] bg-slate-950/60 transition-all duration-300 animate-in fade-in">
        <div className="relative w-full max-w-md rounded-3xl border border-sky-400/30 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 p-6 text-center text-white shadow-2xl backdrop-blur-xl overflow-visible">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />

          <button
            onClick={declineTour}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-slate-800/60 cursor-pointer"
            title="Fechar"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Mascote CLIMA em destaque acenando com overflow visível */}
          <div className="flex justify-center mb-4 mt-2 overflow-visible">
            <ClimaMascot size="lg" variant="dialog" isWaving={true} />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 border border-sky-400/40 px-3 py-1 text-xs font-semibold text-sky-300 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Olá, operador do Recife!</span>
          </div>

          <h2 className="text-xl font-bold font-display text-white tracking-tight mb-2">
            Posso te apresentar o Radar Climático?
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed mb-6 px-2">
            Eu sou o <strong>CLIMA</strong>, seu caranguejo guia! Posso te guiar pela visão geral do sistema ou te levar para conhecer as <strong>funcionalidades internas</strong>!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={acceptTour}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 font-semibold text-white shadow-lg shadow-orange-500/30 hover:from-orange-600 hover:to-amber-600 active:scale-95 transition-all cursor-pointer"
            >
              <span>Vamos</span>
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={declineTour}
              className="w-full sm:w-auto rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700/80 hover:text-white transition-all cursor-pointer"
            >
              Não, explorar sozinho
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // ESTADO DE TOUR ATIVO (Touring): Spotlight Dinâmico + Pop-up Laranja ou Menu Principal
  if (tourState === "touring") {
    const generalSteps = CLIMA_TOUR_STEPS.filter((s) => !s.isSubFeature);
    const subFeatureSteps = CLIMA_TOUR_STEPS.filter((s) => s.isSubFeature);

    return createPortal(
      <div className="fixed inset-0 z-[9999] pointer-events-auto overflow-hidden">
        {/* MODAL DO MENU PRINCIPAL GAMIFICADO */}
        {isMenuOpen && (
          <div className="fixed inset-0 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/80 animate-in fade-in z-50 overflow-y-auto clima-tour-scrollbar">
            <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-orange-500/30 bg-slate-900/98 p-4 sm:p-6 text-white shadow-2xl backdrop-blur-xl my-4 sm:my-8">
              {/* Cabeçalho do Menu Principal */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-orange-500/20 p-1 flex items-center justify-center border border-orange-500/40">
                    <ClimaMascot size="sm" variant="popup" isWaving={true} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">
                      Menu Principal do Tour
                    </h3>
                    <p className="text-xs text-slate-400">
                      Escolha navegar pela visão geral ou explorar as funcionalidades internas avançadas
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                  title="Fechar Menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Seletor de Categorias do Menu: Visão Geral vs Funcionalidades Internas */}
              <div className="flex items-center gap-2 mb-4 p-1 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setMenuTab("geral")}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-xs font-semibold transition-all cursor-pointer ${
                    menuTab === "geral"
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Compass className="h-4 w-4" />
                  <span>Passo a Passo Geral ({generalSteps.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMenuTab("subfeatures")}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-xs font-semibold transition-all cursor-pointer ${
                    menuTab === "subfeatures"
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>Funcionalidades Internas ({subFeatureSteps.length})</span>
                </button>
              </div>

              {/* Lista de Passos Gerais */}
              {menuTab === "geral" && (
                <div className="grid gap-2 max-h-[50vh] overflow-y-auto pr-2 clima-tour-scrollbar">
                  {generalSteps.map((step) => {
                    const originalIdx = CLIMA_TOUR_STEPS.findIndex((s) => s.id === step.id);
                    const isActive = activeStepIndex === originalIdx;
                    return (
                      <button
                        key={step.id}
                        onClick={() => goToStep(originalIdx)}
                        className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isActive
                            ? "bg-orange-500/20 border-orange-500/50 text-white shadow-sm"
                            : "bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 font-mono text-xs font-semibold text-amber-400 border border-slate-700">
                            {originalIdx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-white">{step.menuTitle}</p>
                            <p className="text-[11px] text-slate-400 line-clamp-1">{step.title}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Lista de Sub-funcionalidades Internas (Módulos Especializados) */}
              {menuTab === "subfeatures" && (
                <div className="grid gap-2.5 max-h-[50vh] overflow-y-auto pr-2 clima-tour-scrollbar">
                  {subFeatureSteps.map((step) => {
                    const originalIdx = CLIMA_TOUR_STEPS.findIndex((s) => s.id === step.id);
                    const isActive = activeStepIndex === originalIdx;
                    return (
                      <div
                        key={step.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isActive
                            ? "bg-orange-500/20 border-orange-500/50 shadow-md ring-1 ring-orange-500/30"
                            : "bg-slate-800/50 border-slate-700/60 hover:border-slate-600"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="h-9 w-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0 mt-0.5">
                              {step.category === "sub-mapbiomas" && <Satellite className="h-4 w-4 text-sky-400" />}
                              {step.category === "sub-verde" && <Trees className="h-4 w-4 text-emerald-400" />}
                              {step.category === "sub-nasa" && <FileSpreadsheet className="h-4 w-4 text-amber-400" />}
                              {step.category === "sub-historico" && <ArrowLeftRight className="h-4 w-4 text-indigo-400" />}
                              {step.category === "sub-vulnerabilidade" && <HeartPulse className="h-4 w-4 text-rose-400" />}
                              {step.category === "sub-vegetacao" && <Layers className="h-4 w-4 text-teal-400" />}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-white">{step.menuTitle}</h4>
                              <p className="text-xs text-slate-300 mt-1 leading-snug">{step.title}</p>
                              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                {step.climaSpeech}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => goToStep(originalIdx)}
                            className="shrink-0 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:from-orange-600 hover:to-amber-600 active:scale-95 transition-all cursor-pointer"
                          >
                            <span>Entrar</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Rodapé do Menu */}
              <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  onClick={toggleAudio}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isAudioEnabled ? (
                    <>
                      <Volume2 className="h-4 w-4 text-emerald-400" />
                      <span>Efeitos sonoros: Ativados</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-4 w-4 text-slate-500" />
                      <span>Efeitos sonoros: Mudos</span>
                    </>
                  )}
                </button>
                <button
                  onClick={closeTour}
                  className="text-xs font-semibold text-orange-400 hover:underline cursor-pointer"
                >
                  Encerrar Tour
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OVERLAY ESCURO COM SPOTLIGHT DINÂMICO */}
        {!isMenuOpen && targetRect && (
          <div
            className="fixed inset-0 pointer-events-none transition-all duration-300 ease-out"
            style={{
              backgroundColor: "rgba(3, 7, 18, 0.70)",
              clipPath: `polygon(
                0% 0%, 0% 100%, 100% 100%, 100% 0%,
                ${targetRect.left}px 0%,
                ${targetRect.left}px ${targetRect.top}px,
                ${targetRect.left + targetRect.width}px ${targetRect.top}px,
                ${targetRect.left + targetRect.width}px ${targetRect.top + targetRect.height}px,
                ${targetRect.left}px ${targetRect.top + targetRect.height}px,
                ${targetRect.left}px 0%
              )`,
            }}
          />
        )}

        {/* Borda luminosa no elemento focado */}
        {!isMenuOpen && targetRect && (
          <div
            className="fixed pointer-events-none transition-all duration-300 ease-out rounded-none ring-2 ring-orange-500 shadow-[0_0_24px_rgba(249,115,22,0.45)]"
            style={{
              top: `${targetRect.top}px`,
              left: `${targetRect.left}px`,
              width: `${targetRect.width}px`,
              height: `${targetRect.height}px`,
            }}
          />
        )}

        {/* POP-UP LARANJA DA IDENTIDADE VISUAL COM BOTÃO "MENU PRINCIPAL" */}
        {!isMenuOpen && currentStep && (
          <div
            className="fixed z-50 w-[calc(100vw-24px)] sm:w-full max-w-[380px] animate-in fade-in zoom-in-95 duration-200 transition-all overflow-visible"
            style={{
              top: `${popupPos.top}px`,
              left: `${popupPos.left}px`,
            }}
          >
            <div className="relative overflow-visible rounded-2xl border border-amber-300/40 bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 p-4 text-white shadow-2xl backdrop-blur-lg">
              {/* Brilho decorativo */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 h-28 w-28 rounded-full bg-white/10 blur-xl pointer-events-none" />

              {/* Cabeçalho do Card */}
              <div className="flex items-center justify-between mb-2.5 pb-2.5 border-b border-white/25">
                <div className="flex items-center gap-2 overflow-visible">
                  <div className="h-9 w-9 rounded-full bg-white/20 p-0.5 flex items-center justify-center shrink-0 overflow-visible">
                    <ClimaMascot size="sm" variant="popup" isWaving={true} />
                  </div>
                  <div>
                    <span className="inline-block rounded-full bg-white/25 px-2.5 py-0.5 text-[11px] font-mono font-bold tracking-wide text-white">
                      Passo {activeStepIndex + 1} de {totalSteps}
                    </span>
                  </div>
                </div>

                {/* Botões do Topo: Botão explícito "Menu Principal" + Botão [X] */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      playClick();
                      setIsMenuOpen(true);
                    }}
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg bg-white/25 hover:bg-white/35 active:scale-95 text-white px-2.5 py-1 text-xs font-semibold backdrop-blur-xs transition-all cursor-pointer shadow-xs border border-white/30"
                    title="Abrir o Menu Principal do Tour"
                  >
                    <Compass className="h-3.5 w-3.5 shrink-0" />
                    <span>Menu Principal</span>
                  </button>

                  <button
                    onClick={closeTour}
                    type="button"
                    title="Fechar Tour"
                    className="rounded-lg p-1 text-white/80 hover:bg-white/25 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Título e Fala do CLIMA */}
              <h4 className="font-bold text-sm text-white mb-1.5 leading-snug drop-shadow-xs">
                {currentStep.title}
              </h4>
              <p className="text-xs text-white/95 leading-relaxed mb-4 font-normal">
                {currentStep.climaSpeech}
              </p>

              {/* Rodapé com Navegação [Voltar], [Progresso], [Próximo] */}
              <div className="flex items-center justify-between pt-2 border-t border-white/25">
                <button
                  onClick={prevStep}
                  disabled={activeStepIndex === 0}
                  type="button"
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                    activeStepIndex === 0
                      ? "opacity-40 cursor-not-allowed"
                      : "bg-white/20 hover:bg-white/30 text-white active:scale-95 cursor-pointer"
                  }`}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Voltar</span>
                </button>

                <div className="flex items-center gap-1">
                  {CLIMA_TOUR_STEPS.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        activeStepIndex === i ? "w-3 bg-white" : "w-1.5 bg-white/40"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextStep}
                  type="button"
                  className="flex items-center gap-1 rounded-lg bg-white px-3.5 py-1.5 text-xs font-bold text-orange-600 shadow-md hover:bg-amber-100 active:scale-95 transition-all cursor-pointer"
                >
                  <span>{activeStepIndex === totalSteps - 1 ? "Concluir" : "Próximo"}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>,
      document.body
    );
  }

  return null;
}
