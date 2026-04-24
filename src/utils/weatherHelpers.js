import { ICON_BASE_URL } from './constants'

export const getWeatherIconUrl = (iconCode) =>
  `${ICON_BASE_URL}/${iconCode || '01d'}@2x.png`

export const formatWeekday = (timestamp, timezoneOffset) => {
  const date = new Date((timestamp + timezoneOffset) * 1000)
  return date.toLocaleDateString(undefined, { weekday: 'short' })
}

export const buildFiveDayForecast = (forecastData) => {
  const perDay = new Map()

  forecastData.list.forEach((item) => {
    const localDate = new Date((item.dt + forecastData.city.timezone) * 1000)
    const dayKey = localDate.toISOString().split('T')[0]
    if (!perDay.has(dayKey)) {
      perDay.set(dayKey, [])
    }
    perDay.get(dayKey).push(item)
  })

  return Array.from(perDay.values())
    .slice(0, 5)
    .map((entries) => {
      const bestEntry =
        entries.find((entry) => entry.dt_txt.includes('12:00:00')) || entries[0]
      const temperatures = entries.map((entry) => entry.main.temp)
      return {
        dt: bestEntry.dt,
        icon: bestEntry.weather[0].icon,
        description: bestEntry.weather[0].description,
        minTemp: Math.min(...temperatures),
        maxTemp: Math.max(...temperatures),
      }
    })
}

export const getGradientClassName = (weatherMain, iconCode) => {
  const isNight = iconCode?.endsWith('n')
  const weather = (weatherMain || '').toLowerCase()

  if (isNight) return 'from-slate-950 via-indigo-950 to-slate-900'
  if (weather.includes('rain') || weather.includes('drizzle')) {
    return 'from-slate-700 via-blue-700 to-cyan-700'
  }
  if (weather.includes('thunderstorm')) {
    return 'from-slate-900 via-purple-900 to-slate-700'
  }
  if (weather.includes('snow')) return 'from-sky-200 via-slate-300 to-sky-400'
  if (weather.includes('cloud')) return 'from-slate-600 via-gray-600 to-slate-800'
  if (weather.includes('mist') || weather.includes('fog') || weather.includes('haze')) {
    return 'from-gray-500 via-slate-500 to-zinc-600'
  }
  return 'from-sky-500 via-indigo-500 to-purple-600'
}

export const formatTemperature = (value, symbol) =>
  `${Math.round(value)}°${symbol}`

export const getUvCategory = (uvIndex) => {
  if (uvIndex == null) return 'N/A'
  if (uvIndex < 3) return 'Low'
  if (uvIndex < 6) return 'Moderate'
  if (uvIndex < 8) return 'High'
  if (uvIndex < 11) return 'Very High'
  return 'Extreme'
}

export const formatVisibility = (meters, unitKey) => {
  if (typeof meters !== 'number') return 'N/A'
  if (unitKey === 'imperial') {
    return `${(meters / 1609.34).toFixed(1)} mi`
  }
  return `${(meters / 1000).toFixed(1)} km`
}

export const buildTemperatureTrend = (forecastData) =>
  forecastData.list.slice(0, 8).map((item) => ({
    time: item.dt_txt.slice(11, 16),
    temp: Math.round(item.main.temp),
    feelsLike: Math.round(item.main.feels_like),
  }))

export const getRainProbability = (forecastData) => {
  const samples = forecastData.list.slice(0, 8)
  if (!samples.length) return 0
  const totalPop = samples.reduce((sum, item) => sum + (item.pop || 0), 0)
  return Math.round((totalPop / samples.length) * 100)
}
