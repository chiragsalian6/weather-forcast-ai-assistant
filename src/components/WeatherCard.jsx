import { motion } from 'framer-motion'
import { formatTemperature, getWeatherIconUrl } from '../utils/weatherHelpers'

const WeatherCard = ({ weather, unitSymbol, speedUnit, onAddFavorite }) => {
  if (!weather) return null

  return (
    <motion.article
      className="glass-card p-6 sm:p-7"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">{weather.name}</h2>
          <p className="text-slate-300 capitalize">{weather.weather[0].description}</p>
        </div>
        <button
          onClick={() => onAddFavorite(weather.name)}
          aria-label={`Save ${weather.name} to favorites`}
          className="rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-700"
        >
          Save Favorite
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={getWeatherIconUrl(weather.weather[0].icon)}
            alt={weather.weather[0].description}
            className="h-20 w-20 animate-float"
          />
          <p className="text-5xl font-semibold text-white">
            {formatTemperature(weather.main.temp, unitSymbol)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm sm:text-base">
          <Stat label="Humidity" value={`${weather.main.humidity}%`} />
          <Stat label="Wind" value={`${weather.wind.speed} ${speedUnit}`} />
          <Stat label="Feels like" value={formatTemperature(weather.main.feels_like, unitSymbol)} />
          <Stat label="Pressure" value={`${weather.main.pressure} hPa`} />
        </div>
      </div>
    </motion.article>
  )
}

const Stat = ({ label, value }) => (
  <div className="glass-card-soft px-3 py-2">
    <p className="text-slate-400">{label}</p>
    <p className="font-semibold text-slate-100">{value}</p>
  </div>
)

export default WeatherCard
