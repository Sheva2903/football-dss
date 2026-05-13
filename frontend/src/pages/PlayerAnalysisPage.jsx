import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { formatCurrency, formatDate, formatNumber, formatScore } from '../lib/formatters.js'

const DEFAULT_EVIDENCE_WINDOW = 'last_3_seasons'
const DEFAULT_RELIABILITY_LEVEL = 'Medium'

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

function StateCard({ title, message }) {
  return (
    <div className="state-card">
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  )
}

function ComponentRow({ label, component }) {
  return (
    <div className="component-row">
      <div className="component-row__top">
        <div>
          <strong>{label}</strong>
          <span>{Math.round(component.weight * 100)}% of final DSS</span>
        </div>
        <div className="component-row__numbers">
          <strong>{formatScore(component.score)}</strong>
          <span>{formatScore(component.contribution)} pts</span>
        </div>
      </div>
      <div className="component-bar-track" aria-hidden="true">
        <div className="component-bar-fill" style={{ width: `${Math.min(component.score, 100)}%` }} />
      </div>
    </div>
  )
}

function EvidenceCard({ label, minutes, appearances, active }) {
  return (
    <article className={active ? 'evidence-card evidence-card--active' : 'evidence-card'}>
      <span>{label}</span>
      <strong>{formatNumber(minutes)}</strong>
      <p>{formatNumber(appearances)} appearances</p>
    </article>
  )
}

export default function PlayerAnalysisPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const evidenceWindow = searchParams.get('evidenceWindow') || DEFAULT_EVIDENCE_WINDOW
  const reliabilityLevel = searchParams.get('reliabilityLevel') || DEFAULT_RELIABILITY_LEVEL
  const [samePositionOnly, setSamePositionOnly] = useState(searchParams.get('samePosition') !== 'false')
  const [playerState, setPlayerState] = useState({ status: 'loading', data: null, error: null })
  const [explanationState, setExplanationState] = useState({ status: 'loading', data: null, error: null })
  const [alternativesState, setAlternativesState] = useState({ status: 'loading', items: [], error: null })

  const routeSearch = useMemo(() => {
    const params = new URLSearchParams()
    params.set('evidenceWindow', evidenceWindow)
    params.set('reliabilityLevel', reliabilityLevel)
    params.set('samePosition', String(samePositionOnly))
    return `?${params.toString()}`
  }, [evidenceWindow, reliabilityLevel, samePositionOnly])

  useEffect(() => {
    let cancelled = false

    async function loadPlayerAnalysis() {
      setPlayerState({ status: 'loading', data: null, error: null })
      setExplanationState({ status: 'loading', data: null, error: null })
      setAlternativesState({ status: 'loading', items: [], error: null })

      const [playerResult, explanationResult, alternativesResult] = await Promise.allSettled([
        api.player(id),
        api.scoreExplanation(id, { evidenceWindow, reliabilityLevel }),
        api.similarAlternatives(id, {
          evidenceWindow,
          reliabilityLevel,
          samePosition: samePositionOnly,
          limit: 6,
        }),
      ])

      if (cancelled) {
        return
      }

      if (playerResult.status === 'fulfilled') {
        setPlayerState({ status: 'success', data: playerResult.value.item, error: null })
      } else {
        setPlayerState({ status: 'error', data: null, error: playerResult.reason })
      }

      if (explanationResult.status === 'fulfilled') {
        setExplanationState({ status: 'success', data: explanationResult.value.item, error: null })
      } else {
        setExplanationState({ status: 'error', data: null, error: explanationResult.reason })
      }

      if (alternativesResult.status === 'fulfilled') {
        setAlternativesState({ status: 'success', items: alternativesResult.value.alternatives ?? [], error: null })
      } else {
        setAlternativesState({ status: 'error', items: [], error: alternativesResult.reason })
      }
    }

    if (!id) {
      return undefined
    }

    loadPlayerAnalysis()

    return () => {
      cancelled = true
    }
  }, [id, evidenceWindow, reliabilityLevel, samePositionOnly])

  const player = playerState.data
  const explanation = explanationState.data
  const alternatives = alternativesState.items
  const playerTitle = player?.name || `Player ${id}`

  return (
    <div className="app-shell app-shell--analysis">
      <header className="topbar">
        <div>
          <p className="mono-label">football dss / recruiter desk</p>
          <h1>{playerTitle}</h1>
          <p className="topbar-subtitle">
            Player analysis page with score explanation, evidence context, and similar alternatives.
          </p>
        </div>
        <div className="topbar-actions">
          <Link className="button-secondary" to="/">
            Back to discovery
          </Link>
          <a className="button-primary" href="/api/v1/docs" target="_blank" rel="noreferrer">
            Open API docs
          </a>
        </div>
      </header>

      <section className="panel player-hero">
        <div className="player-hero__summary">
          <span className="eyebrow">Player dossier</span>
          {playerState.status === 'loading' ? (
            <h2>Loading player context…</h2>
          ) : playerState.status === 'error' ? (
            <h2>Player not available</h2>
          ) : (
            <>
              <h2>{player?.name}</h2>
              <p>
                {player?.position} · {player?.age} yrs · {player?.nationality}
              </p>
              <p>
                {player?.clubName} · {player?.clubCountry}
              </p>
            </>
          )}
        </div>
        <div className="player-hero__score">
          <span>Final DSS</span>
          <strong>{explanation ? formatScore(explanation.score.finalDssScore) : '—'}</strong>
          <p>
            Evidence: {evidenceWindow.replaceAll('_', ' ')} · Reliability: {reliabilityLevel}
          </p>
        </div>
      </section>

      <section className="panel analysis-block">
        <SectionHeading eyebrow="Overview" title="Player summary" note="Core context from the player detail API" />

        {playerState.status === 'loading' ? <p className="panel-message">Loading player detail…</p> : null}
        {playerState.status === 'error' ? (
          <StateCard title="Player detail unavailable" message={getErrorMessage(playerState.error, 'Player detail could not be loaded.')} />
        ) : null}

        {playerState.status === 'success' && player ? (
          <div className="analysis-stats-grid">
            <article>
              <span>Market value</span>
              <strong>{formatCurrency(player.marketValueEur)}</strong>
            </article>
            <article>
              <span>Peak value</span>
              <strong>{formatCurrency(player.peakMarketValueEur)}</strong>
            </article>
            <article>
              <span>Total minutes</span>
              <strong>{formatNumber(player.totalMinutes)}</strong>
            </article>
            <article>
              <span>Goals + assists</span>
              <strong>{formatNumber(player.goalContributions)}</strong>
            </article>
            <article>
              <span>Appearances</span>
              <strong>{formatNumber(player.appearancesCount)}</strong>
            </article>
            <article>
              <span>Last valuation</span>
              <strong>{formatDate(player.latestValueDate)}</strong>
            </article>
          </div>
        ) : null}
      </section>

      <section className="panel analysis-block">
        <SectionHeading eyebrow="Score explanation" title="Why the DSS looks this way" note="Component breakdown and evidence summary" />

        {explanationState.status === 'loading' ? <p className="panel-message">Loading score explanation…</p> : null}
        {explanationState.status === 'error' ? (
          <StateCard title="Score explanation unavailable" message={getErrorMessage(explanationState.error, 'Score explanation could not be loaded.')} />
        ) : null}

        {explanationState.status === 'success' && explanation ? (
          <div className="analysis-columns">
            <div className="analysis-stack">
              <div className="score-summary-card">
                <span>Final DSS</span>
                <strong>{formatScore(explanation.score.finalDssScore)}</strong>
                <p>{explanation.formula.finalDssScore}</p>
              </div>

              <ComponentRow label="Production" component={explanation.components.production} />
              <ComponentRow label="Value" component={explanation.components.value} />
              <ComponentRow label="Reliability" component={explanation.components.reliability} />
              <ComponentRow label="Discipline" component={explanation.components.discipline} />
            </div>

            <div className="analysis-side">
              <div className="analysis-note-card">
                <strong>Evidence context</strong>
                <p>
                  The score explanation is anchored to {evidenceWindow.replaceAll('_', ' ')} with {reliabilityLevel.toLowerCase()} reliability.
                </p>
                <p>
                  Reliability threshold: {formatNumber(explanation.reliability.thresholdMinutes)} minutes
                </p>
              </div>

              <div className="evidence-grid">
                <EvidenceCard
                  label="Last season"
                  minutes={explanation.evidence.lastSeason.recentMinutes}
                  appearances={explanation.evidence.lastSeason.recentAppearances}
                  active={evidenceWindow === 'last_season'}
                />
                <EvidenceCard
                  label="Last 3 seasons"
                  minutes={explanation.evidence.last3Seasons.recentMinutes}
                  appearances={explanation.evidence.last3Seasons.recentAppearances}
                  active={evidenceWindow === 'last_3_seasons'}
                />
                <EvidenceCard
                  label="Last 5 seasons"
                  minutes={explanation.evidence.last5Seasons.recentMinutes}
                  appearances={explanation.evidence.last5Seasons.recentAppearances}
                  active={evidenceWindow === 'last_5_seasons'}
                />
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="panel analysis-block">
        <SectionHeading eyebrow="Alternatives" title="Similar cheaper options" note="Comparison section and pivot path" />

        <div className="analysis-toolbar">
          <div className="toggle-group">
            <button
              type="button"
              className={samePositionOnly ? 'toggle-chip toggle-chip--active' : 'toggle-chip'}
              aria-pressed={samePositionOnly}
              onClick={() => setSamePositionOnly(true)}
            >
              Same position
            </button>
            <button
              type="button"
              className={!samePositionOnly ? 'toggle-chip toggle-chip--active' : 'toggle-chip'}
              aria-pressed={!samePositionOnly}
              onClick={() => setSamePositionOnly(false)}
            >
              Any position
            </button>
          </div>
          <span className="section-note">Lens: {evidenceWindow.replaceAll('_', ' ')} · {reliabilityLevel}</span>
        </div>

        {alternativesState.status === 'loading' ? <p className="panel-message">Loading similar alternatives…</p> : null}
        {alternativesState.status === 'error' ? (
          <StateCard title="Similar alternatives unavailable" message={getErrorMessage(alternativesState.error, 'Similar alternatives could not be loaded.')} />
        ) : null}
        {alternativesState.status === 'success' && alternatives.length === 0 ? (
          <p className="panel-message">No alternatives matched the current scouting lens.</p>
        ) : null}

        <div className="alternatives-grid">
          {alternatives.map((item) => (
            <Link key={item.playerId} to={{ pathname: `/players/${item.playerId}`, search: routeSearch }} className="alternative-card">
              <div className="alternative-card__top">
                <strong>{item.name}</strong>
                <span>{formatScore(item.alternativeScore)}</span>
              </div>
              <p>
                {item.position} · {item.clubName}
              </p>
              <div className="alternative-card__meta">
                <span>{formatCurrency(item.marketValueEur, true)}</span>
                <span>Similarity {formatScore(item.similarityScore)}</span>
                <span>Affordability {formatScore(item.affordabilityScore)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
