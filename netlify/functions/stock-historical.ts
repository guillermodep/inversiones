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

    console.log(`Fetching historical data for ${ticker} using yahoo-finance2`)

    const queryOptions = {
      period1: new Date(parseInt(period1) * 1000),
      period2: new Date(parseInt(period2) * 1000),
      interval: interval as any,
    }

    const result = await yahooFinance.historical(ticker, queryOptions)

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
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
