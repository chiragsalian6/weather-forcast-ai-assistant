import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import SearchBar from '../components/SearchBar'
import WeatherCard from '../components/WeatherCard'
import ForecastList from '../components/ForecastList'
import FavoritesList from '../components/FavoritesList'
import HighlightsCard from '../components/HighlightsCard'
import UnitToggle from '../components/UnitToggle'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorAlert from '../components/ErrorAlert'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useWeather } from '../hooks/useWeather'
import {
  DEFAULT_CITY,
  FAVORITES_STORAGE_KEY,
  UNITS,
  UNIT_STORAGE_KEY,
} from '../utils/constants'
import { getGradientClassName } from '../utils/weatherHelpers'

const TemperatureChart = lazy(() => import('../components/TemperatureChart'))
const WeatherRadarMap = lazy(() => import('../components/WeatherRadarMap'))

const WeatherPage = () => {
  const [unit, setUnit] = useLocalStorage(UNIT_STORAGE_KEY, UNITS.metric.key)
  const [favorites, setFavorites] = useLocalStorage(FAVORITES_STORAGE_KEY, [])
  const [infoMessage, setInfoMessage] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const {
    weather,
    forecast,
    loading,
    error,
    highlights,
    temperatureTrend,
    radarTileUrl,
    loadByCity,
    loadByCoords,
  } = useWeather()

  useEffect(() => {
    loadByCity(DEFAULT_CITY, unit)
  }, [loadByCity, unit])

  const handleSearch = (city) => loadByCity(city, unit)

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setInfoMessage('Geolocation is not supported by your browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setInfoMessage('')
        loadByCoords(latitude, longitude, unit)
      },
      () => {
        setInfoMessage('Location access denied. Showing default city weather.')
        loadByCity(DEFAULT_CITY, unit)
      },
      { enableHighAccuracy: true }
    )
  }

  const handleAddFavorite = (cityName) => {
    setFavorites((prev) => (prev.includes(cityName) ? prev : [...prev, cityName]))
  }

  const handleRemoveFavorite = (cityName) => {
    setFavorites((prev) => prev.filter((city) => city !== cityName))
  }

  const backgroundClass = useMemo(
    () => getGradientClassName(weather?.weather?.[0]?.main, weather?.weather?.[0]?.icon),
    [weather]
  )

  return (
    <main
      className={`min-h-screen bg-gradient-to-b p-4 text-slate-100 transition-all duration-700 sm:p-6 lg:p-8 ${backgroundClass.includes('slate-950') ? 'from-slate-950 via-slate-900 to-slate-900' : 'from-slate-950 via-slate-900 to-blue-950'}`}
    >
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-70 [background:linear-gradient(180deg,rgba(2,6,23,0.9),rgba(15,23,42,0.82)),radial-gradient(circle_at_90%_10%,rgba(37,99,235,0.25),transparent_40%)]" />
      <motion.section
        className="mx-auto flex w-full max-w-7xl flex-col gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45 }}
      >
        <header className="glass-card overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-cyan-400" />
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex-1 space-y-3 text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Weather Forecast
              </h1>
              <div className="flex flex-wrap justify-center gap-2 text-xs font-medium">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`rounded-full border px-3 py-1 transition ${
                    activeTab === 'overview'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-200'
                      : 'border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('radar')}
                  className={`rounded-full border px-3 py-1 transition ${
                    activeTab === 'radar'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-200'
                      : 'border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  Radar
                </button>
                <button
                  onClick={() => setActiveTab('trends')}
                  className={`rounded-full border px-3 py-1 transition ${
                    activeTab === 'trends'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-200'
                      : 'border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  Trends
                </button>
              </div>
            </div>
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </header>

        <SearchBar onSearch={handleSearch} onUseCurrentLocation={handleUseCurrentLocation} />

        <ErrorAlert message={error} />
        {infoMessage ? (
          <p className="glass-card-soft border-amber-400/40 bg-amber-500/15 px-4 py-3 text-amber-100">
            {infoMessage}
          </p>
        ) : null}
        {loading ? <LoadingSpinner /> : null}

        {!loading && weather ? (
          <>
            {activeTab === 'overview' && (
              <>
                <WeatherCard
                  weather={weather}
                  unitSymbol={UNITS[unit].symbol}
                  speedUnit={UNITS[unit].speed}
                  onAddFavorite={handleAddFavorite}
                />
                <ForecastList
                  forecast={forecast}
                  timezoneOffset={weather.timezone}
                  unitSymbol={UNITS[unit].symbol}
                />
                <HighlightsCard highlights={highlights} unit={unit} />
              </>
            )}
            {activeTab === 'radar' && (
              <Suspense fallback={<LoadingSpinner />}>
                <WeatherRadarMap weather={weather} radarTileUrl={radarTileUrl} />
              </Suspense>
            )}
            {activeTab === 'trends' && (
              <Suspense fallback={<LoadingSpinner />}>
                <TemperatureChart data={temperatureTrend} unitSymbol={UNITS[unit].symbol} />
              </Suspense>
            )}
          </>
        ) : null}

        <FavoritesList
          favorites={favorites}
          onSelectFavorite={handleSearch}
          onRemoveFavorite={handleRemoveFavorite}
        />
      </motion.section>
    </main>
  )
}

export default WeatherPage
