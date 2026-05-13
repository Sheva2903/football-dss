const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export function buildQuery(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === '' || value === undefined || value === null) {
      return
    }

    searchParams.set(key, String(value))
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

async function request(path, params) {
  const response = await fetch(`${API_BASE}${path}${buildQuery(params)}`)
  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(body.message || 'Request failed')
    error.details = body.errors || null
    throw error
  }

  return body
}

export const api = {
  health: () => request('/health'),
  clubs: () => request('/clubs'),
  positions: () => request('/lookups/positions'),
  rankings: (params) => request('/rankings', params),
  shortlists: (params) => request('/shortlists', params),
  player: (id) => request(`/players/${id}`),
  scoreExplanation: (id, params) => request(`/players/${id}/score-explanation`, params),
  similarAlternatives: (id, params) => request(`/players/${id}/similar-alternatives`, params),
}
