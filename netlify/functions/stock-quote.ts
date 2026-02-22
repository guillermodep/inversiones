import type { Handler, HandlerEvent } from '@netlify/functions'
import yahooFinance from 'yahoo-finance2'

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

    console.log(`Fetching quote for ${ticker} using yahoo-finance2`)

    const quote = await yahooFinance.quote(ticker)

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(quote),
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
