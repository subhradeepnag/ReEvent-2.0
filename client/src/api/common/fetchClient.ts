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
      cache: 'no-store',
    })

    if (!res.ok) {
      const errorData = await res.text()
      throw new Error(`Fetch error: ${res.status} ${errorData}`)
    }

    const contentType = res.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return undefined as T
    }

    return (await res.json()) as T
  } catch (error) {
    console.error('[fetchClient]', error)
    throw error
  }
}
