import { useState } from 'react'
import { VoiceoverOptions } from '../lib/schemas'
import { DEFAULT_VOICE_CONFIG, OPENAI_VOICES } from '../lib/constants'

interface VoiceoverControlsProps {
  onChange: (options: Partial<VoiceoverOptions>) => void
  className?: string
}

export function VoiceoverControls({
  onChange,
  className = '',
}: VoiceoverControlsProps) {
  const [provider, setProvider] = useState<VoiceoverOptions['provider']>(DEFAULT_VOICE_CONFIG.provider)

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Provider</span>
          <select
            value={provider}
            onChange={(e) => {
              const newProvider = e.target.value as VoiceoverOptions['provider']
              setProvider(newProvider)
              onChange({ provider: newProvider })
            }}
            className="px-3 py-2 border rounded"
          >
            <option value="openai">OpenAI</option>
            <option value="elevenlabs">ElevenLabs</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Voice</span>
          <select
            onChange={(e) => onChange({ voice: e.target.value })}
            defaultValue={DEFAULT_VOICE_CONFIG.voice}
            className="px-3 py-2 border rounded"
          >
            {provider === 'openai' ? (
              OPENAI_VOICES.map((voice) => (
                <option key={voice} value={voice}>
                  {voice}
                </option>
              ))
            ) : (
              <>
                <option value="adam">Adam</option>
                <option value="antoni">Antoni</option>
                <option value="arnold">Arnold</option>
                <option value="bella">Bella</option>
                <option value="domi">Domi</option>
                <option value="elli">Elli</option>
                <option value="josh">Josh</option>
                <option value="rachel">Rachel</option>
                <option value="sam">Sam</option>
              </>
            )}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Speed</span>
          <input
            type="number"
            min="0.25"
            max="4.0"
            step="0.25"
            defaultValue={DEFAULT_VOICE_CONFIG.speed}
            onChange={(e) => onChange({ speed: parseFloat(e.target.value) })}
            className="px-3 py-2 border rounded w-24"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Format</span>
          <select
            onChange={(e) => onChange({ format: e.target.value as VoiceoverOptions['format'] })}
            defaultValue={DEFAULT_VOICE_CONFIG.format}
            className="px-3 py-2 border rounded"
          >
            <option value="mp3">MP3</option>
            <option value="opus">Opus</option>
            <option value="aac">AAC</option>
            <option value="flac">FLAC</option>
          </select>
        </label>
      </div>
    </div>
  )
}
