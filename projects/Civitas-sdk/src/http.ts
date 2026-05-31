import { VenomApiError, VenomNetworkError } from './errors'

export interface HttpClient {
  get<T>(path: string): Promise<T>
  post<T>(path: string, body?: unknown): Promise<T>
}

export function createHttpClient(
  baseUrl: string,
  apiKey: string | undefined,
  fetchFn: typeof globalThis.fetch,
): HttpClient {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`
  }

  // Strip trailing slash from base URL
  const base = baseUrl.replace(/\/+$/, '')

  async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    let response: Response
    try {
      response = await fetchFn(`${base}${path}`, {
        method,
        headers,
        body: body != null ? JSON.stringify(body) : undefined,
      })
    } catch (err) {
      throw new VenomNetworkError(
        err instanceof Error ? err.message : 'Network request failed',
      )
    }

    if (!response.ok) {
      let details: unknown
      try {
        details = await response.json()
      } catch {
        // response body wasn't JSON
      }
      const msg =
        details && typeof details === 'object' && 'error' in details
          ? String((details as Record<string, unknown>).error)
          : `HTTP ${response.status}`
      throw new VenomApiError(msg, response.status, details)
    }

    return (await response.json()) as T
  }

  return {
    get<T>(path: string) {
      return request<T>('GET', path)
    },
    post<T>(path: string, body?: unknown) {
      return request<T>('POST', path, body)
    },
  }
}
