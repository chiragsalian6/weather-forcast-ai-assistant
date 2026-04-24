import { motion } from 'framer-motion'
import {
  formatTemperature,
  formatWeekday,
  getWeatherIconUrl,
} from '../utils/weatherHelpers'

const ForecastCard = ({ day, timezoneOffset, unitSymbol, index }) => (
  <motion.article
    className="glass-card-soft p-4 text-center"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.07 }}
    whileHover={{ y: -4 }}
  >
    <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">
      {formatWeekday(day.dt, timezoneOffset)}
    </p>
    <img
      className="mx-auto h-14 w-14"
      src={getWeatherIconUrl(day.icon)}
      alt={day.description}
    />
    <p className="text-slate-300 capitalize text-sm">{day.description}</p>
    <p className="mt-2 font-semibold text-slate-100">
      {formatTemperature(day.maxTemp, unitSymbol)} /{' '}
      <span className="text-slate-400">
        {formatTemperature(day.minTemp, unitSymbol)}
      </span>
    </p>
  </motion.article>
)

export default ForecastCard
