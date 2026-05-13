import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import { formatCurrency, formatNumber, formatScore } from '../lib/formatters.js'

const PAGE_SIZE = 12

const DEFAULT_FILTERS = {
  evidenceWindow: 'last_3_seasons',
  reliabilityLevel: 'Medium',
  position: '',
  clubId: '',
  minAge: '',
  maxAge: '',
  maxBudget: '',
  sortBy: 'finalDssScore',
  sortOrder: 'desc',
  limit: PAGE_SIZE,
  offset: 0,
}

const EVIDENCE_WINDOW_OPTIONS = [
  { value: 'last_season', label: 'Last season' },
  { value: 'last_3_seasons', label: 'Last 3 seasons' },
  { value: 'last_5_seasons', label: 'Last 5 seasons' },
]

const RELIABILITY_OPTIONS = ['Low', 'Medium', 'High']

const SORT_OPTIONS = [
  { value: 'finalDssScore:desc', label: 'Best score first' },
  { value: 'marketValueEur:asc', label: 'Cheapest first' },
  { value: 'name:asc', label: 'Name A–Z' },
]

function buildAnalysisSearch(filters) {
  const searchParams = new URLSearchParams()
  searchParams.set('evidenceWindow', filters.evidenceWindow)
  searchParams.set('reliabilityLevel', filters.reliabilityLevel)
  searchParams.set('samePosition', 'true')

  if (filters.minAge !== '') {
    searchParams.set('minAge', filters.minAge)
  }

  if (filters.maxAge !== '') {
    searchParams.set('maxAge', filters.maxAge)
  }

  if (filters.maxBudget !== '') {
    searchParams.set('maxBudget', filters.maxBudget)
  }

  return `?${searchParams.toString()}`
}

function buildPlayerLink(playerId, filters) {
  return {
    pathname: `/players/${playerId}`,
    search: buildAnalysisSearch(filters),
  }
}

function cleanLens(filters) {
  return {
    evidenceWindow: filters.evidenceWindow,
    reliabilityLevel: filters.reliabilityLevel,
    position: filters.position,
    clubId: filters.clubId,
    minAge: filters.minAge,
    maxAge: filters.maxAge,
    maxBudget: filters.maxBudget,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  }
}

function sortValue(filters) {
  return `${filters.sortBy}:${filters.sortOrder}`
}

function splitSortValue(value) {
  const [sortBy, sortOrder] = value.split(':')
  return { sortBy, sortOrder }
}

function getErrorMessage(error, fallback) {
  if (!error) {
    return fallback
  }

  if (error.details && typeof error.details === 'object') {
    const detail = Object.values(error.details).flat().find(Boolean)
    if (detail) {
      return `${error.message}: ${detail}`
    }
  }

  return error.message || fallback
}

function MetricCard({ label, value, hint }) {
  return (
    <article className="metric-card">
      <p className="mono-label">{label}</p>
      <strong>{value}</strong>
      <span>{hint}</span>
    </article>
  )
}

function StateCard({ title, message }) {
  return (
    <div className="state-card">
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  )
}

function SectionHeading({ eyebrow, title, note }) {
  return (
    <div className="section-heading">
      <div>
        <p className="mono-label">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {note ? <span className="section-note">{note}</span> : null}
    </div>
  )
}

export default function DiscoveryPage() {
  const [lookups, setLookups] = useState({ status: 'loading', clubs: [], positions: [], error: null })
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS)
  const [activeFilters, setActiveFilters] = useState(DEFAULT_FILTERS)
  const [refreshTick, setRefreshTick] = useState(0)
  const [rankingsState, setRankingsState] = useState({
    status: 'loading',
    items: [],
    pagination: { total: 0, offset: 0, limit: PAGE_SIZE },
    error: null,
  })
  const [shortlistState, setShortlistState] = useState({ status: 'loading', items: [], error: null })

  useEffect(() => {
    let cancelled = false

    async function loadLookups() {
      setLookups({ status: 'loading', clubs: [], positions: [], error: null })

      const [clubsResult, positionsResult] = await Promise.allSettled([api.clubs(), api.positions()])
      if (cancelled) {
        return
      }

      const clubs = clubsResult.status === 'fulfilled' ? clubsResult.value.items ?? [] : []
      const positions = positionsResult.status === 'fulfilled' ? positionsResult.value.items ?? [] : []

      setLookups({
        status: clubsResult.status === 'fulfilled' && positionsResult.status === 'fulfilled' ? 'success' : 'error',
        clubs,
        positions,
        error:
          clubsResult.status === 'rejected'
            ? clubsResult.reason
            : positionsResult.status === 'rejected'
              ? positionsResult.reason
              : null,
      })
    }

    loadLookups()

    return () => {
      cancelled = true
    }
  }, [refreshTick])

  const shortlistFilters = useMemo(
    () => ({
      evidenceWindow: activeFilters.evidenceWindow,
      reliabilityLevel: activeFilters.reliabilityLevel,
      position: activeFilters.position,
      clubId: activeFilters.clubId,
      minAge: activeFilters.minAge,
      maxAge: activeFilters.maxAge,
      maxBudget: activeFilters.maxBudget,
      limit: 8,
    }),
    [activeFilters]
  )

  useEffect(() => {
    let cancelled = false

    async function loadDiscoveryData() {
      setRankingsState((current) => ({ ...current, status: 'loading', error: null }))
      setShortlistState((current) => ({ ...current, status: 'loading', error: null }))

      const [rankingsResult, shortlistResult] = await Promise.allSettled([
        api.rankings(activeFilters),
        api.shortlists(shortlistFilters),
      ])

      if (cancelled) {
        return
      }

      if (rankingsResult.status === 'fulfilled') {
        setRankingsState({
          status: 'success',
          items: rankingsResult.value.items ?? [],
          pagination: rankingsResult.value.pagination ?? { total: 0, offset: activeFilters.offset, limit: activeFilters.limit },
          error: null,
        })
      } else {
        setRankingsState({
          status: 'error',
          items: [],
          pagination: { total: 0, offset: activeFilters.offset, limit: activeFilters.limit },
          error: rankingsResult.reason,
        })
      }

      if (shortlistResult.status === 'fulfilled') {
        setShortlistState({
          status: 'success',
          items: shortlistResult.value.items ?? [],
          error: null,
        })
      } else {
        setShortlistState({ status: 'error', items: [], error: shortlistResult.reason })
      }
    }

    loadDiscoveryData()

    return () => {
      cancelled = true
    }
  }, [activeFilters, shortlistFilters, refreshTick])

  const hasPendingFilterChanges = useMemo(() => {
    return JSON.stringify(cleanLens(draftFilters)) !== JSON.stringify(cleanLens(activeFilters))
  }, [draftFilters, activeFilters])

  const totalPages = Math.max(1, Math.ceil((rankingsState.pagination?.total ?? 0) / PAGE_SIZE))
  const currentPage = Math.floor((activeFilters.offset ?? 0) / PAGE_SIZE) + 1
  const canGoPrevious = (activeFilters.offset ?? 0) > 0
  const canGoNext = currentPage < totalPages
  const shortlistLead = shortlistState.items[0]
  const evidenceLabel = EVIDENCE_WINDOW_OPTIONS.find((option) => option.value === activeFilters.evidenceWindow)?.label ?? '—'

  function handleRefresh() {
    setRefreshTick((current) => current + 1)
  }

  function handleDraftChange(event) {
    const { name, value } = event.target
    setDraftFilters((current) => ({ ...current, [name]: value }))
  }

  function handleSortChange(event) {
    const { sortBy, sortOrder } = splitSortValue(event.target.value)
    setDraftFilters((current) => ({ ...current, sortBy, sortOrder }))
  }

  function applyFilters(event) {
    event.preventDefault()
    setActiveFilters({
      ...draftFilters,
      limit: PAGE_SIZE,
      offset: 0,
    })
  }

  function resetFilters() {
    setDraftFilters(DEFAULT_FILTERS)
    setActiveFilters(DEFAULT_FILTERS)
  }

  function changePage(direction) {
    setActiveFilters((current) => ({
      ...current,
      offset: Math.max(0, current.offset + direction * PAGE_SIZE),
    }))
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="mono-label">football dss / recruiter desk</p>
          <h1>Find value before the market does.</h1>
          <p className="topbar-subtitle">
            Discovery page for rankings, shortlist, and the route into deeper player analysis.
          </p>
        </div>
        <div className="topbar-actions">
          <button type="button" className="button-secondary" onClick={handleRefresh}>
            Refresh board
          </button>
          <a className="button-primary" href="/api/v1/docs" target="_blank" rel="noreferrer">
            Open API docs
          </a>
        </div>
      </header>

      <section className="hero-panel panel">
        <div className="hero-copy">
          <span className="eyebrow">Read-heavy scouting workbench</span>
          <p>
            Keep the filter set compact, read the rankings quickly, and move shortlisted players into the dedicated
            analysis page when you need more detail.
          </p>
        </div>
        <div className="summary-grid">
          <MetricCard
            label="Ranked pool"
            value={formatNumber(rankingsState.pagination?.total ?? 0)}
            hint="Players meeting current evidence thresholds"
          />
          <MetricCard
            label="Top shortlist"
            value={shortlistLead ? shortlistLead.name : '—'}
            hint={shortlistLead ? `${formatScore(shortlistLead.finalDssScore)} DSS score` : 'No shortlist result'}
          />
          <MetricCard label="Evidence mode" value={evidenceLabel} hint={`${activeFilters.reliabilityLevel} reliability`} />
        </div>
      </section>

      <main className="workspace-grid">
        <aside className="panel filters-panel">
          <SectionHeading eyebrow="Filters" title="Recruitment lens" note={hasPendingFilterChanges ? 'Apply to refresh' : ''} />

          <form className="filters-form" onSubmit={applyFilters}>
            <label>
              <span>Evidence window</span>
              <select name="evidenceWindow" value={draftFilters.evidenceWindow} onChange={handleDraftChange}>
                {EVIDENCE_WINDOW_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Reliability level</span>
              <select name="reliabilityLevel" value={draftFilters.reliabilityLevel} onChange={handleDraftChange}>
                {RELIABILITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Position</span>
              <select name="position" value={draftFilters.position} onChange={handleDraftChange}>
                <option value="">All positions</option>
                {lookups.positions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Club</span>
              <select name="clubId" value={draftFilters.clubId} onChange={handleDraftChange}>
                <option value="">Any club</option>
                {lookups.clubs.map((club) => (
                  <option key={club.clubId} value={club.clubId}>
                    {club.clubName}
                  </option>
                ))}
              </select>
            </label>

            <div className="split-fields">
              <label>
                <span>Min age</span>
                <input name="minAge" type="number" min="0" value={draftFilters.minAge} onChange={handleDraftChange} />
              </label>
              <label>
                <span>Max age</span>
                <input name="maxAge" type="number" min="0" value={draftFilters.maxAge} onChange={handleDraftChange} />
              </label>
            </div>

            <label>
              <span>Max budget (€)</span>
              <input name="maxBudget" type="number" min="0" step="100000" value={draftFilters.maxBudget} onChange={handleDraftChange} />
            </label>

            <label>
              <span>Sort board</span>
              <select value={sortValue(draftFilters)} onChange={handleSortChange}>
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="filter-actions">
              <button type="submit" className="button-primary button-primary--full">
                Apply filters
              </button>
              <button type="button" className="button-secondary button-secondary--full" onClick={resetFilters}>
                Reset
              </button>
            </div>
          </form>

          {lookups.status === 'error' ? (
            <StateCard title="Lookup filters not loaded" message={getErrorMessage(lookups.error, 'Lookup filters could not be loaded.')} />
          ) : null}
        </aside>

        <div className="content-stack">
          <section className="panel board-panel">
            <SectionHeading eyebrow="Board" title="Ranked candidates" note={`${formatNumber(rankingsState.pagination?.total ?? 0)} total matches`} />

            <div className="board-columns" aria-hidden="true">
              <span>Player</span>
              <span>Club</span>
              <span>Market</span>
              <span>DSS</span>
            </div>

            {rankingsState.status === 'error' ? (
              <StateCard title="Unable to load rankings" message={getErrorMessage(rankingsState.error, 'Rankings could not be loaded.')} />
            ) : null}

            {rankingsState.status === 'loading' ? <p className="panel-message">Refreshing rankings…</p> : null}

            {rankingsState.status === 'success' && rankingsState.items.length === 0 ? (
              <p className="panel-message">No candidates match the current scouting lens.</p>
            ) : null}

            <div className="rankings-list">
              {rankingsState.items.map((item) => (
                <Link key={item.playerId} to={buildPlayerLink(item.playerId, activeFilters)} className="ranking-row">
                  <div className="ranking-row__identity">
                    <span className="ranking-row__rank">#{item.rank}</span>
                    <div>
                      <strong>{item.name}</strong>
                      <span>
                        {item.position} · {item.age} yrs · {item.nationality}
                      </span>
                    </div>
                  </div>

                  <div className="ranking-row__club">
                    <strong>{item.clubName}</strong>
                    <span>{item.clubCountry}</span>
                  </div>

                  <div className="ranking-row__market">
                    <strong>{formatCurrency(item.marketValueEur, true)}</strong>
                    <span>{formatNumber(item.recentMinutes)} recent mins</span>
                  </div>

                  <div className="ranking-row__score">
                    <strong>{formatScore(item.finalDssScore)}</strong>
                    <span>SVI {formatScore(item.smartValueIndex)}</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="pagination-bar">
              <button type="button" className="button-secondary" onClick={() => changePage(-1)} disabled={!canGoPrevious}>
                Previous
              </button>
              <button type="button" className="button-secondary" onClick={() => changePage(1)} disabled={!canGoNext}>
                Next
              </button>
            </div>
          </section>

          <section className="panel shortlist-panel">
            <SectionHeading eyebrow="Shortlist" title="Top quick targets" note="Dedicated recruiter section" />

            {shortlistState.status === 'error' ? (
              <StateCard title="Unable to load shortlist" message={getErrorMessage(shortlistState.error, 'Shortlist could not be loaded.')} />
            ) : null}

            {shortlistState.status === 'loading' ? <p className="panel-message">Loading shortlist…</p> : null}

            {shortlistState.status === 'success' && shortlistState.items.length === 0 ? (
              <p className="panel-message">No shortlist items match the current scouting lens.</p>
            ) : null}

            <div className="shortlist-grid">
              {shortlistState.items.map((item, index) => (
                <Link key={item.playerId} to={buildPlayerLink(item.playerId, activeFilters)} className="shortlist-card">
                  <div className="shortlist-card__top">
                    <span className="shortlist-card__rank">#{index + 1}</span>
                    <strong>{formatScore(item.finalDssScore)}</strong>
                  </div>
                  <strong className="shortlist-card__name">{item.name}</strong>
                  <p>
                    {item.position} · {item.clubName}
                  </p>
                  <span>
                    {formatCurrency(item.marketValueEur, true)} · {formatNumber(item.recentMinutes)} mins · {item.nationality}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
