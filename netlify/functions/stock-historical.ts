import type { Handler, HandlerEvent } from '@netlify/functions'

export const handler: Handler = async (event: HandlerEvent) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    const ticker = event.queryStringParameters?.ticker
    const period1 = event.queryStringParameters?.period1
    const period2 = event.queryStringParameters?.period2
    const interval = event.queryStringParameters?.interval || '1d'
    
    if (!ticker || !period1 || !period2) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'ticker, period1, and period2 are required' }),
      }
    }

    console.log(`Fetching historical data for ${ticker} from Yahoo Finance`)

    // Direct Yahoo Finance API call
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${period1}&period2=${period2}&interval=${interval}`
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`Yahoo Finance returned ${response.status}`)
    }

    const data = await response.json()
    const result = data?.chart?.result?.[0]

    if (!result || !result.timestamp) {
      throw new Error('Invalid response from Yahoo Finance')
    }

    // Transform to simple array format
    const timestamps = result.timestamp
    const quote = result.indicators?.quote?.[0]
    
    const historicalData = timestamps.map((timestamp: number, index: number) => ({
      date: new Date(timestamp * 1000).toISOString(),
      open: quote?.open?.[index] || 0,
      high: quote?.high?.[index] || 0,
      low: quote?.low?.[index] || 0,
      close: quote?.close?.[index] || 0,
      volume: quote?.volume?.[index] || 0,
    }))

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(historicalData),
    }
  } catch (error: any) {
    console.error('Error fetching historical data:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch historical data',
        message: error.message 
      }),
    }
  }
}
