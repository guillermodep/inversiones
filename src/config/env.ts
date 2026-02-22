export const env = {
  llm: {
    provider: (import.meta.env.VITE_LLM_PROVIDER || 'azure') as 'azure' | 'openai' | 'anthropic',
    
    // Azure OpenAI
    azure: {
      endpoint: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || '',
      apiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY || '',
      deployment: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT || '',
      apiVersion: import.meta.env.VITE_AZURE_OPENAI_API_VERSION || '2025-01-01-preview',
    },
    
    // OpenAI Direct
    openai: {
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o',
    },
    
    // Anthropic
    anthropic: {
      apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
      model: import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    },
  },
  marketData: {
    alphaVantageKey: import.meta.env.VITE_ALPHA_VANTAGE_KEY || '',
    fmpKey: import.meta.env.VITE_FMP_KEY || '',
  },
  news: {
    newsApiKey: import.meta.env.VITE_NEWS_API_KEY || '',
    finnhubKey: import.meta.env.VITE_FINNHUB_KEY || '',
  },
}

export function hasLLMConfig(): boolean {
  if (env.llm.provider === 'azure') {
    return !!(env.llm.azure.endpoint && env.llm.azure.apiKey && env.llm.azure.deployment)
  } else if (env.llm.provider === 'openai') {
    return !!env.llm.openai.apiKey
  } else if (env.llm.provider === 'anthropic') {
    return !!env.llm.anthropic.apiKey
  }
  return false
}

export function hasMarketDataConfig(): boolean {
  return !!(env.marketData.alphaVantageKey || env.marketData.fmpKey)
}

export function hasNewsConfig(): boolean {
  return !!(env.news.newsApiKey || env.news.finnhubKey)
}
