/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LLM_PROVIDER: string
  
  // Azure OpenAI
  readonly VITE_AZURE_OPENAI_ENDPOINT: string
  readonly VITE_AZURE_OPENAI_API_KEY: string
  readonly VITE_AZURE_OPENAI_DEPLOYMENT: string
  readonly VITE_AZURE_OPENAI_API_VERSION: string
  
  // OpenAI Direct
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_OPENAI_MODEL: string
  
  // Anthropic
  readonly VITE_ANTHROPIC_API_KEY: string
  readonly VITE_ANTHROPIC_MODEL: string
  
  // Market Data
  readonly VITE_ALPHA_VANTAGE_KEY: string
  readonly VITE_FMP_KEY: string
  
  // News
  readonly VITE_NEWS_API_KEY: string
  readonly VITE_FINNHUB_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
