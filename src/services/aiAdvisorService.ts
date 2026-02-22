import { StockData, NewsItem } from '@/types'
import { callLLM } from './llmService'

interface Recommendation {
  ticker: string
  name: string
  action: 'buy' | 'sell' | 'hold'
  reason: string
  currentPrice: number
  type: 'stock' | 'etf' | 'bond'
}

interface WeeklyAnalysisResult {
  recommendations: Recommendation[]
  duplicateWarnings: string[]
  marketSummary: string
}

export async function getWeeklyRecommendations(
  stocks: StockData[],
  news: NewsItem[]
): Promise<WeeklyAnalysisResult> {
  // Categorize instruments
  const etfTickers = ['SPY', 'QQQ', 'IWM', 'VTI', 'VOO', 'DIA', 'EEM', 'GLD']
  const bondTickers = ['TLT', 'IEF', 'SHY', 'AGG', 'BND', 'LQD', 'HYG', 'MUB']
  
  const stocksWithType = stocks.map(s => ({
    ...s,
    type: bondTickers.includes(s.ticker) ? 'bond' as const : 
          etfTickers.includes(s.ticker) ? 'etf' as const : 
          'stock' as const
  }))

  // Prepare data for LLM
  const stockSummary = stocksWithType.map(s => 
    `${s.ticker} (${s.type.toUpperCase()}) - ${s.name}: $${s.price.toFixed(2)}, Change: ${s.changePercent.toFixed(2)}%, Volume: ${s.volume}`
  ).join('\n')

  const newsSummary = news.slice(0, 10).map(n => 
    `• ${n.title} (${n.source})`
  ).join('\n')

  const prompt = `Eres un asesor financiero agresivo enfocado en maximizar ganancias. Analiza los siguientes datos de mercado y noticias para dar recomendaciones semanales.

DATOS DE MERCADO (${stocks.length} instrumentos):
${stockSummary}

NOTICIAS RECIENTES:
${newsSummary}

INSTRUCCIONES:
1. Selecciona 8-12 instrumentos TOTALES para recomendar (distribuidos entre comprar, vender, mantener)
2. Prioriza GANANCIAS sobre seguridad - sé agresivo pero fundamentado
3. Usa datos históricos (changePercent) y noticias para justificar
4. Detecta duplicaciones: si recomiendas AAPL y también SPY (que contiene AAPL), menciona la duplicación
5. Sé BREVE pero CONCISO en cada razón (máximo 2 líneas)

FORMATO DE RESPUESTA (JSON estricto):
{
  "marketSummary": "Resumen breve del mercado en 2-3 líneas",
  "recommendations": [
    {
      "ticker": "AAPL",
      "action": "buy",
      "reason": "Razón breve y concisa"
    }
  ],
  "duplicateWarnings": [
    "Si compras AAPL y SPY, tendrás exposición duplicada a Apple (7% de SPY)"
  ]
}

ACCIONES VÁLIDAS: "buy", "sell", "hold"

Responde SOLO con el JSON, sin texto adicional.`

  try {
    const response = await callLLM([
      { role: 'system', content: 'Eres un asesor financiero experto y agresivo. Respondes SOLO en formato JSON válido.' },
      { role: 'user', content: prompt }
    ])

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No se pudo parsear la respuesta del LLM')
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Enrich recommendations with current data
    const enrichedRecommendations: Recommendation[] = parsed.recommendations.map((rec: any) => {
      const stockData = stocksWithType.find(s => s.ticker === rec.ticker)
      if (!stockData) {
        console.warn(`Stock ${rec.ticker} not found in data`)
        return null
      }

      return {
        ticker: rec.ticker,
        name: stockData.name,
        action: rec.action,
        reason: rec.reason,
        currentPrice: stockData.price,
        type: stockData.type
      }
    }).filter((r: any): r is Recommendation => r !== null)

    return {
      recommendations: enrichedRecommendations,
      duplicateWarnings: parsed.duplicateWarnings || [],
      marketSummary: parsed.marketSummary || 'Análisis del mercado completado.'
    }

  } catch (error) {
    console.error('Error calling LLM for weekly recommendations:', error)
    throw new Error('Error al generar recomendaciones. Verifica tu configuración de IA.')
  }
}
