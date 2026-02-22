import { CacheEntry } from '@/types'

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function setCache<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
  }
  localStorage.setItem(key, JSON.stringify(entry))
}

export function getCache<T>(key: string, durationMinutes?: number): T | null {
  const item = localStorage.getItem(key)
  if (!item) return null

  try {
    const entry: CacheEntry<T> = JSON.parse(item)
    const cacheDuration = durationMinutes ? durationMinutes * 60 * 1000 : CACHE_DURATION
    const isExpired = Date.now() - entry.timestamp > cacheDuration
    
    if (isExpired) {
      localStorage.removeItem(key)
      return null
    }
    
    return entry.data
  } catch {
    return null
  }
}

export function clearCache(key?: string): void {
  if (key) {
    localStorage.removeItem(key)
  } else {
    const keys = Object.keys(localStorage)
    keys.forEach(k => {
      if (k.startsWith('cache_')) {
        localStorage.removeItem(k)
      }
    })
  }
}
