import axios from 'axios'
import { LLMRecommendation, HistoricalData, NewsItem, FundamentalData } from '@/types'
import { env } from '@/config/env'

const OPENAI_BASE = 'https://api.openai.com/v1'
const ANTHROPIC_BASE = 'https://api.anthropic.com/v1'

interface AnalysisContext {
  ticker: string
  historicalData: HistoricalData[]
  news: NewsItem[]
  fundamentals: FundamentalData | null
  currentPrice: number
}

export async function analyzeStock(
  context: AnalysisContext
): Promise<LLMRecommendation> {
  const prompt = buildAnalysisPrompt(context)

  if (env.llm.provider === 'azure') {
    return analyzeWithAzureOpenAI(prompt)
  } else if (env.llm.provider === 'openai') {
    return analyzeWithOpenAI(prompt, env.llm.openai.apiKey, env.llm.openai.model)
  } else {
    return analyzeWithAnthropic(prompt, env.llm.anthropic.apiKey, env.llm.anthropic.model)
  }
}

function buildAnalysisPrompt(context: AnalysisContext): string {
  const { ticker, historicalData, news, fundamentals, currentPrice } = context

  const recentPrices = historicalData.slice(-90).map(d => ({
    date: d.date,
    close: d.close,
  }))

  const newsHeadlines = news.slice(0, 10).map(n => `- ${n.title} (${n.publishedAt})`).join('\n')

  return `Eres un analista financiero experto. Analiza la acción ${ticker} y proporciona una recomendación de inversión.

DATOS ACTUALES:
- Precio actual: $${currentPrice}
- Precio hace 30 días: $${recentPrices[recentPrices.length - 30]?.close || 'N/A'}
- Precio hace 90 días: $${recentPrices[0]?.close || 'N/A'}

FUNDAMENTALES:
${fundamentals ? `
- EPS: ${fundamentals.eps || 'N/A'}
- Revenue: ${fundamentals.revenue || 'N/A'}
- Debt/Equity: ${fundamentals.debtToEquity || 'N/A'}
- Free Cash Flow: ${fundamentals.freeCashFlow || 'N/A'}
- Dividend Yield: ${fundamentals.dividendYield || 'N/A'}%
` : 'No disponibles'}

NOTICIAS RECIENTES:
${newsHeadlines || 'No hay noticias disponibles'}

INSTRUCCIONES:
Proporciona tu análisis en formato JSON con la siguiente estructura:
{
  "recommendation": "COMPRAR" | "MANTENER" | "VENDER",
  "confidence": "Alta" | "Media" | "Baja",
  "targetPrice30Days": número,
  "targetPrice90Days": número,
  "reasons": ["razón 1", "razón 2", "razón 3"],
  "risks": ["riesgo 1", "riesgo 2"],
  "horizon": "descripción del horizonte temporal recomendado",
  "analysis": "análisis detallado en 2-3 párrafos"
}

IMPORTANTE: 
- Responde SOLO con el JSON, sin texto adicional
- Esta es una recomendación orientativa, no asesoramiento financiero
- Considera tendencias técnicas, fundamentales y sentimiento de noticias
- Sé conservador en tus estimaciones`
}

async function analyzeWithAzureOpenAI(prompt: string): Promise<LLMRecommendation> {
  try {
    const url = `${env.llm.azure.endpoint}/openai/deployments/${env.llm.azure.deployment}/chat/completions?api-version=${env.llm.azure.apiVersion}`
    
    const requestBody = {
      messages: [
        {
          role: 'system',
          content: 'Eres un analista financiero experto. Responde siempre en español con análisis detallados y estructurados en formato JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_completion_tokens: 32000,
    }
    
    const response = await axios.post(
      url,
      requestBody,
      {
        headers: {
          'api-key': env.llm.azure.apiKey,
          'Content-Type': 'application/json',
        },
      }
    )

    const content = response.data.choices[0].message.content
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta')
    }
    
    return JSON.parse(jsonMatch[0])
  } catch (error: any) {
    console.error('Error analyzing with Azure OpenAI:', error)
    console.error('Error details:', error.response?.data)
    console.error('Status:', error.response?.status)
    throw new Error(`Error al analizar con Azure OpenAI: ${error.response?.data?.error?.message || error.message}`)
  }
}

async function analyzeWithOpenAI(prompt: string, apiKey: string, model: string): Promise<LLMRecommendation> {
  try {
    const response = await axios.post(
      `${OPENAI_BASE}/chat/completions`,
      {
        model: model || 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Eres un analista financiero experto que proporciona recomendaciones de inversión en formato JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const content = response.data.choices[0].message.content
    return JSON.parse(content)
  } catch (error) {
    console.error('Error analyzing with OpenAI:', error)
    throw new Error('Error al analizar con OpenAI. Verifica tu API key.')
  }
}

async function analyzeWithAnthropic(prompt: string, apiKey: string, model: string): Promise<LLMRecommendation> {
  try {
    const response = await axios.post(
      `${ANTHROPIC_BASE}/messages`,
      {
        model: model || 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      }
    )

    const content = response.data.content[0].text
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('No se pudo extraer JSON de la respuesta')
  } catch (error) {
    console.error('Error analyzing with Anthropic:', error)
    throw new Error('Error al analizar con Anthropic. Verifica tu API key.')
  }
}

export async function analyzePortfolio(
  positions: any[]
): Promise<string> {
  const prompt = `Eres un analista financiero experto. Analiza el siguiente portfolio de inversiones y proporciona recomendaciones de rebalanceo.

POSICIONES:
${positions.map(p => `- ${p.ticker}: ${p.shares} acciones @ $${p.purchasePrice} (actual: $${p.currentPrice || 'N/A'})`).join('\n')}

Proporciona:
1. Evaluación general del portfolio (diversificación, riesgo, sectores)
2. Posiciones que deberías considerar vender y por qué
3. Posiciones que deberías mantener y por qué
4. Sugerencias de nuevas posiciones para mejorar diversificación
5. Estrategia de rebalanceo recomendada

Responde en español, de forma clara y estructurada.`

  if (env.llm.provider === 'azure') {
    const url = `${env.llm.azure.endpoint}/openai/deployments/${env.llm.azure.deployment}/chat/completions?api-version=${env.llm.azure.apiVersion}`
    const response = await axios.post(
      url,
      {
        messages: [{ role: 'user', content: prompt }],
        max_completion_tokens: 16000,
      },
      {
        headers: {
          'api-key': env.llm.azure.apiKey,
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data.choices[0].message.content
  } else if (env.llm.provider === 'openai') {
    const response = await axios.post(
      `${OPENAI_BASE}/chat/completions`,
      {
        model: env.llm.openai.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${env.llm.openai.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data.choices[0].message.content
  } else {
    const response = await axios.post(
      `${ANTHROPIC_BASE}/messages`,
      {
        model: env.llm.anthropic.model,
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'x-api-key': env.llm.anthropic.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data.content[0].text
  }
}

export async function buildPortfolioWithAI(
  budget: number,
  horizon: string,
  risk: string,
  sectors: string[]
): Promise<any> {
  const prompt = `Eres un asesor financiero experto. Construye un portfolio de inversiones con los siguientes parámetros:

- Presupuesto: $${budget}
- Horizonte temporal: ${horizon}
- Tolerancia al riesgo: ${risk}
- Sectores de interés: ${sectors.join(', ')}

Proporciona un portfolio sugerido en formato JSON:
{
  "portfolio": [
    {
      "ticker": "AAPL",
      "name": "Apple Inc.",
      "allocation": 15,
      "shares": 10,
      "reason": "razón de inclusión"
    }
  ],
  "strategy": "descripción de la estrategia general",
  "expectedReturn": "retorno esperado anual",
  "riskLevel": "nivel de riesgo del portfolio"
}

Responde SOLO con el JSON, sin texto adicional.`

  if (env.llm.provider === 'azure') {
    const url = `${env.llm.azure.endpoint}/openai/deployments/${env.llm.azure.deployment}/chat/completions?api-version=${env.llm.azure.apiVersion}`
    const response = await axios.post(
      url,
      {
        messages: [{ role: 'user', content: prompt }],
        max_completion_tokens: 16000,
      },
      {
        headers: {
          'api-key': env.llm.azure.apiKey,
          'Content-Type': 'application/json',
        },
      }
    )
    const content = response.data.choices[0].message.content
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null
  } else if (env.llm.provider === 'openai') {
    const response = await axios.post(
      `${OPENAI_BASE}/chat/completions`,
      {
        model: env.llm.openai.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          'Authorization': `Bearer ${env.llm.openai.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )
    return JSON.parse(response.data.choices[0].message.content)
  } else {
    const response = await axios.post(
      `${ANTHROPIC_BASE}/messages`,
      {
        model: env.llm.anthropic.model,
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'x-api-key': env.llm.anthropic.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      }
    )
    const content = response.data.content[0].text
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null
  }
}

export async function extractPortfolioFromImage(
  imageBase64: string
): Promise<any[]> {
  const prompt = `Extrae la información de las posiciones de inversión de esta imagen. Busca tickers/símbolos de acciones y cantidades.

Responde en formato JSON:
{
  "positions": [
    {
      "ticker": "AAPL",
      "shares": 100,
      "price": 150.50
    }
  ]
}

Responde SOLO con el JSON.`

  if (env.llm.provider === 'azure') {
    const url = `${env.llm.azure.endpoint}/openai/deployments/${env.llm.azure.deployment}/chat/completions?api-version=${env.llm.azure.apiVersion}`
    const response = await axios.post(
      url,
      {
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              },
            ],
          },
        ],
        max_completion_tokens: 16000,
      },
      {
        headers: {
          'api-key': env.llm.azure.apiKey,
          'Content-Type': 'application/json',
        },
      }
    )
    const content = response.data.choices[0].message.content
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { positions: [] }
    return result.positions || []
  } else if (env.llm.provider === 'openai') {
    const response = await axios.post(
      `${OPENAI_BASE}/chat/completions`,
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          'Authorization': `Bearer ${env.llm.openai.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )
    const result = JSON.parse(response.data.choices[0].message.content)
    return result.positions || []
  } else {
    const response = await axios.post(
      `${ANTHROPIC_BASE}/messages`,
      {
        model: env.llm.anthropic.model,
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
              { type: 'text', text: prompt },
            ],
          },
        ],
      },
      {
        headers: {
          'x-api-key': env.llm.anthropic.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      }
    )
    const content = response.data.content[0].text
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { positions: [] }
    return result.positions || []
  }
}
