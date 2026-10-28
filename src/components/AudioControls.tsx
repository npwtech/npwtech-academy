import { Pause, Play, RotateCcw, Square, SkipBack, SkipForward, FileText, Volume2, VolumeX } from 'lucide-react';
import { useProgress } from '../state/progress';
import { useSpeech } from '../state/speech';

interface Props {
  trackId: string;
  transcriptOpen: boolean;
  onToggleTranscript: () => void;
}

const RATES = [0.75, 0.85, 0.92, 1, 1.15, 1.3];

export function AudioControls({ trackId, transcriptOpen, onToggleTranscript }: Props) {
  const speech = useSpeech();
  const { state, updateSettings } = useProgress();
  const mine = speech.trackId === trackId;
  const status = mine ? speech.status : 'idle';
  const narrationOn = state.settings.narration;
  const canSpeak = speech.supported && narrationOn;
  const atStart = !mine || speech.index === 0;
  const atEnd = !mine || speech.index >= speech.sentences.length - 1;

  const mainLabel =
    status === 'playing' ? 'Pausar' : status === 'paused' ? 'Continuar' : status === 'ended' ? 'Ouvir de novo' : 'Ouvir aula';

  const onMain = () => {
    if (status === 'playing') speech.pause();
    else if (status === 'paused') speech.resume();
    else speech.play();
  };

  const rateValue = RATES.includes(state.settings.rate) ? String(state.settings.rate) : 'custom';

  return (
    <div className="audio" role="group" aria-label="Controles da narração">
      <div className="audio__row">
        <button type="button" className="btn btn-primary audio__main" onClick={onMain} disabled={!canSpeak}>
          {status === 'playing' ? <Pause /> : <Play />}
          {mainLabel}
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => speech.seek(speech.index - 1)}
          disabled={atStart}
          aria-label="Frase anterior"
          title="Frase anterior"
        >
          <SkipBack />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={speech.repeat}
          disabled={!canSpeak || !mine}
          aria-label="Repetir a frase atual"
          title="Repetir a frase atual"
        >
          <RotateCcw />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => speech.seek(speech.index + 1)}
          disabled={atEnd}
          aria-label="Próxima frase"
          title="Próxima frase"
        >
          <SkipForward />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={speech.stop}
          disabled={status !== 'playing' && status !== 'paused'}
          aria-label="Parar narração"
          title="Parar narração"
        >
          <Square />
        </button>
      </div>

      <div className="audio__row audio__row--secondary">
        <label className="audio__rate">
          <span>Velocidade</span>
          <select
            className="select"
            value={rateValue}
            onChange={(e) => updateSettings({ rate: Number(e.target.value) })}
            disabled={!speech.supported}
          >
            {rateValue === 'custom' && <option value="custom">{state.settings.rate.toFixed(2)}×</option>}
            {RATES.map((r) => (
              <option key={r} value={r}>
                {r === 0.92 ? '0,92× (padrão)' : `${String(r).replace('.', ',')}×`}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          aria-pressed={narrationOn}
          onClick={() => updateSettings({ narration: !narrationOn })}
          disabled={!speech.supported}
        >
          {narrationOn ? <Volume2 /> : <VolumeX />}
          {narrationOn ? 'Narração ligada' : 'Narração desligada'}
        </button>
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          aria-expanded={transcriptOpen}
          aria-controls={`${trackId}-transcricao`}
          onClick={onToggleTranscript}
        >
          <FileText />
          {transcriptOpen ? 'Ocultar transcrição' : 'Mostrar transcrição'}
        </button>
      </div>
    </div>
  );
}
