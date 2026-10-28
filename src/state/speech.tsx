import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useProgress } from './progress';

// Motor de narração único para todo o app, baseado na Web Speech API (SpeechSynthesis).
// Cada frase vira uma "utterance": isso permite legendas sincronizadas, repetir a frase atual
// e evita o corte de falas longas que alguns navegadores aplicam.
// O estado visual (falando, pausado, concluído) só muda a partir dos eventos reais da API.

export type SpeechStatus = 'idle' | 'playing' | 'paused' | 'ended' | 'error';

interface SpeechApi {
  supported: boolean;
  voices: SpeechSynthesisVoice[];
  activeVoice: SpeechSynthesisVoice | null;
  status: SpeechStatus;
  error: string | null;
  trackId: string | null;
  sentences: string[];
  index: number;
  load: (trackId: string, sentences: string[], onEnded?: () => void) => void;
  play: (from?: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  repeat: () => void;
  seek: (index: number) => void;
  test: () => void;
}

const Ctx = createContext<SpeechApi | null>(null);

const synth = (): SpeechSynthesis | null =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'
    ? window.speechSynthesis
    : null;

function pickVoice(voices: SpeechSynthesisVoice[], uri: string | null) {
  if (uri) {
    const chosen = voices.find((v) => v.voiceURI === uri);
    if (chosen) return chosen;
  }
  const norm = (l: string) => l.toLowerCase().replace('_', '-');
  const ptBR = voices.filter((v) => norm(v.lang) === 'pt-br');
  // Vozes "Google" e "Microsoft … Online" costumam soar melhor; dá preferência a elas.
  const ranked = [...ptBR].sort((a, b) => score(b) - score(a));
  return ranked[0] ?? voices.find((v) => norm(v.lang).startsWith('pt')) ?? null;
}
function score(v: SpeechSynthesisVoice) {
  let s = 0;
  if (/google/i.test(v.name)) s += 2;
  if (/online|natural|neural/i.test(v.name)) s += 3;
  if (v.localService) s += 1;
  return s;
}

export function SpeechProvider({ children }: { children: ReactNode }) {
  const { state } = useProgress();
  const settings = state.settings;
  const engine = synth();
  const supported = !!engine;

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [trackId, setTrackId] = useState<string | null>(null);
  const [sentences, setSentences] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  const gen = useRef(0); // invalida eventos de falas canceladas
  const trackRef = useRef<string | null>(null);
  const sentencesRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const statusRef = useRef<SpeechStatus>('idle');
  const onEndedRef = useRef<(() => void) | undefined>();
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  const setStatusBoth = (s: SpeechStatus) => {
    statusRef.current = s;
    setStatus(s);
  };
  const setIndexBoth = (i: number) => {
    indexRef.current = i;
    setIndex(i);
  };

  useEffect(() => {
    if (!engine) return;
    const update = () => {
      const list = engine.getVoices();
      voicesRef.current = list;
      setVoices(list);
    };
    update();
    engine.addEventListener?.('voiceschanged', update);
    const t = window.setTimeout(update, 600);
    return () => {
      engine.removeEventListener?.('voiceschanged', update);
      window.clearTimeout(t);
    };
  }, [engine]);

  // Garante que nada continue falando ao fechar a página.
  useEffect(() => () => engine?.cancel(), [engine]);

  const activeVoice = useMemo(() => pickVoice(voices, settings.voiceURI), [voices, settings.voiceURI]);
  const activeVoiceRef = useRef(activeVoice);
  activeVoiceRef.current = activeVoice;

  const speakIndex = useCallback(
    (i: number) => {
      if (!engine) return;
      const list = sentencesRef.current;
      if (i < 0 || i >= list.length) return;
      const myGen = ++gen.current;
      engine.cancel();
      setError(null);
      setIndexBoth(i);
      const u = new SpeechSynthesisUtterance(list[i]);
      const v = activeVoiceRef.current;
      if (v) u.voice = v;
      u.lang = v?.lang ?? 'pt-BR';
      u.rate = settingsRef.current.rate;
      u.pitch = settingsRef.current.pitch;
      u.onstart = () => {
        if (myGen === gen.current) setStatusBoth('playing');
      };
      u.onend = () => {
        if (myGen !== gen.current) return;
        const next = i + 1;
        if (next < sentencesRef.current.length && statusRef.current !== 'paused') {
          speakIndex(next);
        } else if (next >= sentencesRef.current.length) {
          setStatusBoth('ended');
          onEndedRef.current?.();
        }
      };
      u.onerror = (e) => {
        if (myGen !== gen.current) return;
        if (e.error === 'interrupted' || e.error === 'canceled') return;
        setStatusBoth('error');
        setError(
          e.error === 'not-allowed'
            ? 'O navegador bloqueou o áudio. Clique em “Ouvir” novamente para iniciar a narração.'
            : 'Não foi possível reproduzir a narração neste navegador. A transcrição continua disponível abaixo.',
        );
      };
      // Chrome às vezes fica "preso" em pausa; retomar antes de falar evita isso.
      if (engine.paused) engine.resume();
      engine.speak(u);
    },
    [engine],
  );

  const stop = useCallback(() => {
    gen.current++;
    engine?.cancel();
    setStatusBoth('idle');
  }, [engine]);

  const load = useCallback(
    (id: string, list: string[], onEnded?: () => void) => {
      onEndedRef.current = onEnded;
      if (trackRef.current === id) return;
      // Troca de aula: interrompe a narração anterior antes de carregar a nova.
      trackRef.current = id;
      gen.current++;
      engine?.cancel();
      sentencesRef.current = list;
      setSentences(list);
      setIndexBoth(0);
      setStatusBoth('idle');
      setError(null);
      setTrackId(id);
    },
    [engine],
  );

  const play = useCallback(
    (from?: number) => {
      if (!engine) return;
      if (!settingsRef.current.narration) return;
      const start = from ?? (statusRef.current === 'ended' ? 0 : indexRef.current);
      speakIndex(start);
    },
    [engine, speakIndex],
  );

  const pause = useCallback(() => {
    if (!engine || statusRef.current !== 'playing') return;
    engine.pause();
    setStatusBoth('paused');
  }, [engine]);

  const resume = useCallback(() => {
    if (!engine || statusRef.current !== 'paused') return;
    const myGen = gen.current;
    engine.resume();
    setStatusBoth('playing');
    // Alguns navegadores não retomam de verdade: recomeça a frase atual se nada estiver tocando.
    window.setTimeout(() => {
      if (myGen === gen.current && statusRef.current === 'playing' && (!engine.speaking || engine.paused)) {
        speakIndex(indexRef.current);
      }
    }, 450);
  }, [engine, speakIndex]);

  const repeat = useCallback(() => {
    if (statusRef.current === 'ended') speakIndex(sentencesRef.current.length - 1);
    else speakIndex(indexRef.current);
  }, [speakIndex]);

  const seek = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(i, sentencesRef.current.length - 1));
      if (statusRef.current === 'playing' || statusRef.current === 'paused') {
        speakIndex(clamped);
      } else {
        setIndexBoth(clamped);
        if (statusRef.current === 'ended') setStatusBoth('idle');
      }
    },
    [speakIndex],
  );

  const test = useCallback(() => {
    if (!engine) return;
    gen.current++;
    engine.cancel();
    setStatusBoth('idle');
    const u = new SpeechSynthesisUtterance('Olá! Eu sou o robô da NPWTech. Esta é a minha voz.');
    const v = activeVoiceRef.current;
    if (v) u.voice = v;
    u.lang = v?.lang ?? 'pt-BR';
    u.rate = settingsRef.current.rate;
    u.pitch = settingsRef.current.pitch;
    engine.speak(u);
  }, [engine]);

  // Mudança de voz, velocidade ou timbre durante a fala: aplica a partir da frase atual.
  const lastSettings = useRef({ rate: settings.rate, pitch: settings.pitch, voice: activeVoice?.voiceURI });
  useEffect(() => {
    const prev = lastSettings.current;
    const changed = prev.rate !== settings.rate || prev.pitch !== settings.pitch || prev.voice !== activeVoice?.voiceURI;
    lastSettings.current = { rate: settings.rate, pitch: settings.pitch, voice: activeVoice?.voiceURI };
    if (changed && statusRef.current === 'playing') speakIndex(indexRef.current);
  }, [settings.rate, settings.pitch, activeVoice, speakIndex]);

  // Desativar a narração interrompe qualquer fala em andamento.
  useEffect(() => {
    if (!settings.narration && (statusRef.current === 'playing' || statusRef.current === 'paused')) stop();
  }, [settings.narration, stop]);

  const api: SpeechApi = {
    supported,
    voices,
    activeVoice,
    status,
    error,
    trackId,
    sentences,
    index,
    load,
    play,
    pause,
    resume,
    stop,
    repeat,
    seek,
    test,
  };
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useSpeech() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSpeech precisa estar dentro de SpeechProvider');
  return ctx;
}
