/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_ELEVENLABS_API_KEY: string
  readonly VITE_NODE_ENV: string
  readonly PORT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
