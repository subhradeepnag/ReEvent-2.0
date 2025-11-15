type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  token?: string
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export async function fetchClient<T>(endpoint: string, { method = 'GET', body, token }: FetchOptions = {}): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}/${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store', // for SSR, or remove for default caching
    })

    if (!res.ok) {
      const errorData = await res.text()
      throw new Error(`Fetch error: ${res.status} ${errorData}`)
    }

    return await res.json()
  } catch (error) {
    console.error('[fetchClient]', error)
    throw error
  }
}
