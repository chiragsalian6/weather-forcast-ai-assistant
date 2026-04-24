import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const sections = [
  { id: 'home', label: 'Home' },
  { id: 'decision', label: 'Decision AI' },
  { id: 'insights', label: 'AI Insights' },
  { id: 'trends', label: 'Trend Analysis' },
  { id: 'yesterday', label: 'Vs Yesterday' },
  { id: 'health', label: 'Health Impact' },
  { id: 'compare', label: 'Compare Cities' },
  { id: 'micro', label: 'Micro Forecast' },
]

const SectionCard = ({ title, subtitle, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
    {subtitle ? <p className="mb-4 mt-1 text-sm text-slate-500">{subtitle}</p> : null}
    {children}
  </section>
)

const Skeleton = () => <div className="h-24 animate-pulse rounded-xl bg-slate-200" />

const fetchJson = async (url, options) => {
  const response = await fetch(url, options)
  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const message =
      isJson && payload && typeof payload === 'object'
        ? payload.error || 'Request failed'
        : typeof payload === 'string' && payload.trim()
          ? payload.trim()
          : 'Request failed'
    throw new Error(message)
  }

  if (!isJson) {
    throw new Error('Server returned a non-JSON response.')
  }

  return payload
}

function App() {
  const [city, setCity] = useState('Bengaluru')
  const [query, setQuery] = useState('Bengaluru')
  const [cityA, setCityA] = useState('Bengaluru')
  const [cityB, setCityB] = useState('Mumbai')
  const [active, setActive] = useState('home')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState({})
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)

  const loadDashboard = async (selectedCity = city) => {
    setLoading(true)
    setError('')
    try {
      const [weather, decision, insights, trends, health, micro] = await Promise.all([
        fetchJson(`/weather?city=${encodeURIComponent(selectedCity)}`),
        fetchJson(`/decision-ai?city=${encodeURIComponent(selectedCity)}`),
        fetchJson(`/ai-insights?city=${encodeURIComponent(selectedCity)}`),
        fetchJson(`/trend-analysis?city=${encodeURIComponent(selectedCity)}`),
        fetchJson(`/health?city=${encodeURIComponent(selectedCity)}`),
        fetchJson(`/micro-forecast?city=${encodeURIComponent(selectedCity)}`),
      ])
      setCity(selectedCity)
      setQuery(selectedCity)
      setData((prev) => ({ ...prev, weather, decision, insights, trends, health, micro }))
    } catch (err) {
      setError(err.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const clean = query.trim()
    if (clean.length < 2) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        const result = await fetchJson(`/city-suggestions?query=${encodeURIComponent(clean)}`)
        setSuggestions(result.suggestions || [])
      } catch {
        setSuggestions([])
      }
    }, 220)

    return () => clearTimeout(timer)
  }, [query])

  const yesterdayDiff = useMemo(() => {
    if (!data.weather) return null
    const current = data.weather.current
    const y = data.weather.yesterday
    return {
      temp: (current.main.temp - y.temp).toFixed(1),
      humidity: Math.round(current.main.humidity - y.humidity),
      wind: (current.wind.speed - y.wind).toFixed(1),
    }
  }, [data.weather])

  const handleCompare = async () => {
    try {
      const compare = await fetchJson(
        `/compare-cities?cityA=${encodeURIComponent(cityA)}&cityB=${encodeURIComponent(cityB)}`
      )
      setData((prev) => ({ ...prev, compare }))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.')
      return
    }

    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const weatherAtLocation = await fetchJson(
            `/weather/by-coords?lat=${coords.latitude}&lon=${coords.longitude}`
          )
          await loadDashboard(weatherAtLocation.city)
        } catch (err) {
          setError(err.message || 'Unable to fetch weather by your location.')
        } finally {
          setGeoLoading(false)
        }
      },
      () => {
        setGeoLoading(false)
        setError('Location access denied. Please allow GPS to use this feature.')
      }
    )
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-[#163f7a] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-5 py-4">
          <h1 className="text-2xl font-semibold tracking-tight">weather forcast</h1>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-3">
          <nav className="flex gap-2 overflow-x-auto pb-1">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
                  active === section.id
                    ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                onClick={() => setActive(section.id)}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-5 p-5">
        <SectionCard title="Location Search">
          <div className="relative grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <div>
              <input
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Type city name (e.g., mum)"
              />
              {showSuggestions && suggestions.length > 0 ? (
                <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                  {suggestions.map((item) => (
                    <button
                      key={`${item.label}-${item.lat}-${item.lon}`}
                      className="block w-full border-b border-slate-100 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        setQuery(item.name)
                        setShowSuggestions(false)
                        loadDashboard(item.name)
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button
              className="rounded-lg bg-[#ef7f1a] px-4 py-2 text-sm font-medium text-white hover:bg-[#da7318]"
              onClick={() => {
                setShowSuggestions(false)
                loadDashboard(query.trim() || city)
              }}
            >
              Search
            </button>
            <button
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={handleUseGps}
            >
              {geoLoading ? 'Locating...' : 'Use GPS'}
            </button>
          </div>
        </SectionCard>

        <div className="space-y-5">
          {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</div> : null}
          {loading ? <Skeleton /> : null}

          {active === 'home' && data.weather ? (
            <SectionCard
              title={`${data.weather.city} Forecast`}
              subtitle="Current conditions and upcoming hourly forecast"
            >
              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-xl bg-[#163f7a] p-4 text-white">
                  <p className="text-sm text-blue-100">Temperature</p>
                  <p className="text-3xl font-semibold">{Math.round(data.weather.current.main.temp)}°</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Condition</p>
                  <p className="text-xl font-semibold text-slate-900">
                    {data.weather.current.weather?.[0]?.main || 'Clear'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Humidity</p>
                  <p className="text-xl font-semibold text-slate-900">{data.weather.current.main.humidity}%</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Wind</p>
                  <p className="text-xl font-semibold text-slate-900">{data.weather.current.wind.speed} m/s</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200">
                <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase text-slate-500">
                  <span>Time</span>
                  <span>Temp</span>
                  <span>Rain</span>
                  <span>Condition</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {(data.weather.hourly || []).slice(0, 8).map((item) => (
                    <div key={item.dt} className="grid grid-cols-4 px-4 py-2 text-sm text-slate-700">
                      <span>{item.dt_txt?.slice(11, 16)}</span>
                      <span>{Math.round(item.main.temp)}°</span>
                      <span>{Math.round((item.pop || 0) * 100)}%</span>
                      <span>{item.weather?.[0]?.main || '-'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          ) : null}

          {active === 'decision' && data.decision ? (
            <SectionCard title="Decision AI">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Go Outside</p>
                  <p className="text-xl font-semibold text-slate-900">{data.decision.goOutside.verdict}</p>
                  <p className="text-xs text-slate-500">{data.decision.goOutside.bestWindow}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Travel</p>
                  <p className="text-xl font-semibold text-slate-900">{data.decision.travel.verdict}</p>
                  <p className="text-xs text-slate-500">{data.decision.travel.reason}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Sports</p>
                  <p className="text-xl font-semibold text-slate-900">{data.decision.sports.verdict}</p>
                  <p className="text-xs text-slate-500">{data.decision.sports.bestWindow}</p>
                </div>
              </div>
              <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                {data.decision.summary}
              </p>
            </SectionCard>
          ) : null}

          {active === 'insights' && data.insights ? (
            <SectionCard title="AI Insights">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  Best outside: {data.insights.insights.outside}
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  Best jogging: {data.insights.insights.jogging}
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  Warning: {data.insights.insights.warning}
                </div>
              </div>
              <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                {data.insights.summary}
              </p>
            </SectionCard>
          ) : null}

          {active === 'trends' && data.trends ? (
            <SectionCard title="Trend Analysis" subtitle={data.trends.summary}>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.trends.trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="temperature" stroke="#3b82f6" fill="#3b82f633" name="Today" />
                    <Line type="monotone" dataKey="yesterdayProxy" stroke="#f59e0b" name="Yesterday proxy" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-slate-600">
                {data.trends.delta >= 0 ? '+' : ''}
                {data.trends.delta}°C higher than yesterday.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(data.trends.anomalies || []).map((a) => (
                  <span
                    key={`${a.time}-${a.message}`}
                    className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700"
                  >
                    {a.time} - {a.message}
                  </span>
                ))}
              </div>
            </SectionCard>
          ) : null}

          {active === 'yesterday' && yesterdayDiff ? (
            <SectionCard title="Weather vs Yesterday">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
                  Today is {yesterdayDiff.temp}°C hotter than yesterday.
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
                  Humidity changed by {yesterdayDiff.humidity}%.
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
                  Wind changed by {yesterdayDiff.wind} m/s.
                </div>
              </div>
            </SectionCard>
          ) : null}

          {active === 'health' && data.health ? (
            <SectionCard title="Health Impact">
              <div className="space-y-2">
                {data.health.alerts.map((alert) => (
                  <div key={alert} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-700">
                    {alert}
                  </div>
                ))}
              </div>
              <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                {data.health.summary}
              </p>
            </SectionCard>
          ) : null}

          {active === 'compare' ? (
            <SectionCard title="Compare Cities">
              <div className="mb-3 grid gap-3 md:grid-cols-3">
                <input
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2"
                  value={cityA}
                  onChange={(e) => setCityA(e.target.value)}
                />
                <input
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2"
                  value={cityB}
                  onChange={(e) => setCityB(e.target.value)}
                />
                <button className="rounded-lg bg-[#ef7f1a] px-4 py-2 text-white hover:bg-[#da7318]" onClick={handleCompare}>
                  Compare
                </button>
              </div>
              {data.compare ? (
                <>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
                      Cooler: {data.compare.comparison.cooler}
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
                      Less rain: {data.compare.comparison.lessRain}
                    </div>
                  </div>
                  <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    {data.compare.summary}
                  </p>
                </>
              ) : null}
            </SectionCard>
          ) : null}

          {active === 'micro' && data.micro ? (
            <SectionCard title="Micro Forecast">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
                  {data.micro.insight.feels}
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
                  {data.micro.insight.rain30m}
                </div>
              </div>
              <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                {data.micro.summary}
              </p>
            </SectionCard>
          ) : null}
        </div>
      </div>
    </main>
  )
}

export default App
