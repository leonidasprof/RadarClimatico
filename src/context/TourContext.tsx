import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { CLIMA_TOUR_STEPS, type TourStep } from "@/constants/tourStepsData";

export type TourState = "idle" | "asking" | "touring" | "docked";

export type TourNavHandler = (tab: string, layer?: "calor" | "vegetal" | "vulnerabilidade") => void;

interface TourContextType {
  tourState: TourState;
  activeStepIndex: number;
  currentStep: TourStep | null;
  totalSteps: number;
  isAudioEnabled: boolean;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  registerNavHandler: (handler: TourNavHandler) => void;
  acceptTour: () => void;
  declineTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  closeTour: () => void;
  openTourFromDock: () => void;
  toggleAudio: () => void;
  playClick: () => void;
  playWhoosh: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const STORAGE_KEY = "arboris_clima_tour_v2";

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [tourState, setTourState] = useState<TourState>("idle");
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Callback de navegação registrado pela rota principal (index.tsx)
  const navHandlerRef = useRef<TourNavHandler | null>(null);

  const registerNavHandler = useCallback((handler: TourNavHandler) => {
    navHandlerRef.current = handler;
  }, []);

  // Web Audio API context ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioInitializedRef = useRef<boolean>(false);

  // Inicializa o AudioContext após o primeiro gesto do usuário
  const initAudio = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtxRef.current = new AudioCtxClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
    audioInitializedRef.current = true;
  }, []);

  // Som de click tátil: oscilador rápido e decaimento exponencial
  const playClick = useCallback(() => {
    if (!isAudioEnabled) return;
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const now = ctx.currentTime;
      osc.type = "sine";
      osc.frequency.setValueAtTime(1000, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignora silenciosamente
    }
  }, [isAudioEnabled, initAudio]);

  // Som de whoosh rápido/grave para transições
  const playWhoosh = useCallback(() => {
    if (!isAudioEnabled) return;
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const now = ctx.currentTime;
      const duration = 0.22;

      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(160, now + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + duration);
    } catch {
      // Ignora silenciosamente
    }
  }, [isAudioEnabled, initAudio]);

  // Verifica estado inicial no carregamento da tela
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "completed" || saved === "skipped") {
        setTourState("docked");
      } else {
        timer = setTimeout(() => {
          setTourState("asking");
        }, 800);
      }
    } catch {
      setTourState("asking");
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Dispara a navegação automática para o módulo correspondente do passo
  const syncStepRoute = useCallback((step: TourStep) => {
    if (navHandlerRef.current && step.requiredTab) {
      navHandlerRef.current(step.requiredTab, step.requiredLayer);
    }
  }, []);

  const acceptTour = useCallback(() => {
    initAudio();
    playClick();
    setTourState("touring");
    setActiveStepIndex(0);
    setIsMenuOpen(false);
    const firstStep = CLIMA_TOUR_STEPS[0];
    if (firstStep) syncStepRoute(firstStep);
  }, [initAudio, playClick, syncStepRoute]);

  const declineTour = useCallback(() => {
    initAudio();
    playClick();
    setTourState("docked");
    try {
      localStorage.setItem(STORAGE_KEY, "skipped");
    } catch {}
  }, [initAudio, playClick]);

  const nextStep = useCallback(() => {
    playWhoosh();
    setActiveStepIndex((prev) => {
      const nextIdx = prev + 1;
      if (nextIdx >= CLIMA_TOUR_STEPS.length) {
        setTourState("docked");
        try {
          localStorage.setItem(STORAGE_KEY, "completed");
        } catch {}
        return 0;
      }
      const targetStep = CLIMA_TOUR_STEPS[nextIdx];
      if (targetStep) syncStepRoute(targetStep);
      return nextIdx;
    });
  }, [playWhoosh, syncStepRoute]);

  const prevStep = useCallback(() => {
    playWhoosh();
    setActiveStepIndex((prev) => {
      const prevIdx = Math.max(0, prev - 1);
      const targetStep = CLIMA_TOUR_STEPS[prevIdx];
      if (targetStep) syncStepRoute(targetStep);
      return prevIdx;
    });
  }, [playWhoosh, syncStepRoute]);

  const goToStep = useCallback(
    (index: number) => {
      playWhoosh();
      if (index >= 0 && index < CLIMA_TOUR_STEPS.length) {
        setActiveStepIndex(index);
        setTourState("touring");
        setIsMenuOpen(false);
        const targetStep = CLIMA_TOUR_STEPS[index];
        if (targetStep) syncStepRoute(targetStep);
      }
    },
    [playWhoosh, syncStepRoute]
  );

  const closeTour = useCallback(() => {
    playClick();
    setTourState("docked");
  }, [playClick]);

  const openTourFromDock = useCallback(() => {
    initAudio();
    playClick();
    setTourState("touring");
    setIsMenuOpen(true);
  }, [initAudio, playClick]);

  const toggleAudio = useCallback(() => {
    setIsAudioEnabled((prev) => !prev);
  }, []);

  const currentStep =
    tourState === "touring" && CLIMA_TOUR_STEPS[activeStepIndex]
      ? CLIMA_TOUR_STEPS[activeStepIndex]
      : null;

  return (
    <TourContext.Provider
      value={{
        tourState,
        activeStepIndex,
        currentStep,
        totalSteps: CLIMA_TOUR_STEPS.length,
        isAudioEnabled,
        isMenuOpen,
        setIsMenuOpen,
        registerNavHandler,
        acceptTour,
        declineTour,
        nextStep,
        prevStep,
        goToStep,
        closeTour,
        openTourFromDock,
        toggleAudio,
        playClick,
        playWhoosh,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour deve ser usado dentro de um TourProvider");
  }
  return context;
}
