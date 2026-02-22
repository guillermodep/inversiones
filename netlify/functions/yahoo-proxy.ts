import type { Handler, HandlerEvent } from '@netlify/functions'

export const handler: Handler = async (event: HandlerEvent) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  }

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  try {
    // Extract path after /yahoo-proxy/
    const path = event.path.replace('/.netlify/functions/yahoo-proxy', '')
    const queryString = event.rawQuery ? `?${event.rawQuery}` : ''
    
    const yahooUrl = `https://query1.finance.yahoo.com${path}${queryString}`
    
    console.log('Proxying request to:', yahooUrl)
    
    // Use native fetch instead of axios to avoid bundling issues
    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`Yahoo Finance returned ${response.status}`)
    }

    const data = await response.json()

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  } catch (error: any) {
    console.error('Yahoo Finance proxy error:', error.message)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch from Yahoo Finance',
        message: error.message 
      }),
    }
  }
}
