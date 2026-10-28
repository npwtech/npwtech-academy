import { useEffect, useMemo, useRef } from 'react';
import { AlertTriangle, Volume2, X } from 'lucide-react';
import { DEFAULT_SETTINGS, useProgress } from '../state/progress';
import { useSpeech } from '../state/speech';
import { Switch } from './ProgressIndicator';

export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { state, updateSettings } = useProgress();
  const speech = useSpeech();
  const s = state.settings;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      if (typeof d.showModal === 'function') d.showModal();
      else d.setAttribute('open', '');
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  // Vozes em português primeiro; as demais em seguida.
  const groups = useMemo(() => {
    const pt = speech.voices.filter((v) => v.lang.toLowerCase().startsWith('pt'));
    const other = speech.voices.filter((v) => !v.lang.toLowerCase().startsWith('pt'));
    return { pt, other };
  }, [speech.voices]);

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="settings-title"
      onClose={onClose}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="dialog__head">
        <h2 id="settings-title">Áudio e acessibilidade</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar configurações">
          <X />
        </button>
      </div>

      <div className="dialog__body">
        <section className="dialog__group" aria-label="Narração">
          <span className="tag">Narração do robô</span>
          {!speech.supported && (
            <p className="notice notice--error">
              <AlertTriangle />
              <span>
                <strong>Voz indisponível.</strong> Este navegador não oferece síntese de voz. As aulas continuam
                disponíveis com legendas e transcrição.
              </span>
            </p>
          )}
          <Switch
            id="set-narration"
            label="Ativar narração"
            hint="Quando desligada, o robô não fala e você acompanha pela transcrição."
            checked={s.narration}
            onChange={(v) => updateSettings({ narration: v })}
          />

          {speech.supported && (
            <>
              <div className="field">
                <label htmlFor="set-voice">Voz</label>
                <select
                  id="set-voice"
                  className="select"
                  value={speech.activeVoice?.voiceURI ?? ''}
                  onChange={(e) => updateSettings({ voiceURI: e.target.value || null })}
                  disabled={speech.voices.length === 0}
                >
                  {speech.voices.length === 0 && <option value="">Carregando vozes do dispositivo…</option>}
                  {groups.pt.length > 0 && (
                    <optgroup label="Português">
                      {groups.pt.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {groups.other.length > 0 && (
                    <optgroup label="Outros idiomas">
                      {groups.other.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                {speech.voices.length > 0 && groups.pt.length === 0 && (
                  <p className="dialog__note">
                    Nenhuma voz em português foi encontrada neste dispositivo. A narração usará a voz padrão do navegador.
                  </p>
                )}
              </div>

              <div className="range-row">
                <div className="range-row__top">
                  <label htmlFor="set-rate">Velocidade</label>
                  <output htmlFor="set-rate">{s.rate.toFixed(2)}×</output>
                </div>
                <input
                  id="set-rate"
                  className="range"
                  type="range"
                  min={0.6}
                  max={1.4}
                  step={0.05}
                  value={s.rate}
                  onChange={(e) => updateSettings({ rate: Number(e.target.value) })}
                />
              </div>

              <div className="range-row">
                <div className="range-row__top">
                  <label htmlFor="set-pitch">Timbre</label>
                  <output htmlFor="set-pitch">{s.pitch.toFixed(2)}</output>
                </div>
                <input
                  id="set-pitch"
                  className="range"
                  type="range"
                  min={0.5}
                  max={1.5}
                  step={0.05}
                  value={s.pitch}
                  onChange={(e) => updateSettings({ pitch: Number(e.target.value) })}
                />
                <small>Valores menores deixam a voz mais grave e com som mais tecnológico.</small>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <button type="button" className="btn btn-sm" onClick={speech.test} disabled={!s.narration}>
                  <Volume2 />
                  Testar voz
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => updateSettings({ rate: DEFAULT_SETTINGS.rate, pitch: DEFAULT_SETTINGS.pitch, voiceURI: null })}
                >
                  Restaurar padrão
                </button>
              </div>
              <p className="dialog__note">
                As vozes disponíveis dependem do seu sistema e navegador. No Windows, o Microsoft Edge costuma oferecer
                as vozes em português mais naturais.
              </p>
            </>
          )}
        </section>

        <section className="dialog__group" aria-label="Leitura e movimento">
          <span className="tag">Leitura e movimento</span>
          <Switch
            id="set-captions"
            label="Legendas sob o robô"
            hint="Mostra a frase que está sendo narrada."
            checked={s.captions}
            onChange={(v) => updateSettings({ captions: v })}
          />
          <Switch
            id="set-large"
            label="Texto maior"
            hint="Aumenta o tamanho de todos os textos da plataforma."
            checked={s.largeText}
            onChange={(v) => updateSettings({ largeText: v })}
          />
          <Switch
            id="set-motion"
            label="Reduzir animações"
            hint="Desliga a flutuação do robô e as transições. Também segue a preferência do seu sistema."
            checked={s.reduceMotion}
            onChange={(v) => updateSettings({ reduceMotion: v })}
          />
        </section>
      </div>
    </dialog>
  );
}
