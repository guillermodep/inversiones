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

    console.log(`Fetching fundamentals for ${ticker} from Yahoo Finance quoteSummary`)

    // Yahoo Finance quoteSummary endpoint for fundamental data
    const modules = 'price,summaryDetail,defaultKeyStatistics,financialData'
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=${modules}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`Yahoo Finance returned ${response.status}`)
    }

    const data = await response.json()
    const result = data?.quoteSummary?.result?.[0]

    if (!result) {
      throw new Error('Invalid response from Yahoo Finance quoteSummary')
    }

    // Extract fundamental data from different modules
    const fundamentals = {
      marketCap: result.price?.marketCap?.raw || result.summaryDetail?.marketCap?.raw,
      peRatio: result.summaryDetail?.trailingPE?.raw || result.defaultKeyStatistics?.trailingPE?.raw,
      forwardPE: result.summaryDetail?.forwardPE?.raw,
      beta: result.defaultKeyStatistics?.beta?.raw || result.summaryDetail?.beta?.raw,
      eps: result.defaultKeyStatistics?.trailingEps?.raw,
      dividendYield: result.summaryDetail?.dividendYield?.raw,
      avgVolume: result.price?.averageDailyVolume10Day?.raw || result.summaryDetail?.averageDailyVolume10Day?.raw,
      fiftyTwoWeekHigh: result.summaryDetail?.fiftyTwoWeekHigh?.raw,
      fiftyTwoWeekLow: result.summaryDetail?.fiftyTwoWeekLow?.raw,
    }

    console.log(`Got fundamentals for ${ticker}:`, fundamentals)

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(fundamentals),
    }
  } catch (error: any) {
    console.error('Error fetching fundamentals:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch fundamentals',
        message: error.message 
      }),
    }
  }
}
