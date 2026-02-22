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
    
    if (!ticker) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Ticker parameter is required' }),
      }
    }

    console.log(`Fetching quote for ${ticker} from Yahoo Finance`)

    // Direct Yahoo Finance API call
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`
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

    if (!result || !result.meta) {
      throw new Error('Invalid response from Yahoo Finance')
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(result.meta),
    }
  } catch (error: any) {
    console.error('Error fetching stock quote:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch stock quote',
        message: error.message 
      }),
    }
  }
}
