import { useCallback, useState } from 'react'
import {
  fetchCurrentWeatherByCity,
  fetchCurrentWeatherByCoords,
  fetchForecastByCity,
  fetchForecastByCoords,
  fetchOneCallByCoords,
  getRadarTileUrl,
} from '../utils/weatherApi'
import {
  buildFiveDayForecast,
  buildTemperatureTrend,
  getRainProbability,
} from '../utils/weatherHelpers'

export const useWeather = () => {
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [highlights, setHighlights] = useState(null)
  const [temperatureTrend, setTemperatureTrend] = useState([])
  const [radarTileUrl, setRadarTileUrl] = useState('')

  const updateAdvancedMetrics = useCallback(async (currentData, forecastData, units) => {
    setTemperatureTrend(buildTemperatureTrend(forecastData))
    setRadarTileUrl(getRadarTileUrl())

    try {
      const oneCallData = await fetchOneCallByCoords({
        lat: currentData.coord.lat,
        lon: currentData.coord.lon,
        units,
      })
      setHighlights({
        rainProbability: getRainProbability(forecastData),
        uvIndex: oneCallData?.current?.uvi ?? null,
        pressure: currentData.main.pressure,
        visibility: currentData.visibility,
      })
    } catch {
      setHighlights({
        rainProbability: getRainProbability(forecastData),
        uvIndex: null,
        pressure: currentData.main.pressure,
        visibility: currentData.visibility,
      })
    }
  }, [])

  const loadByCity = useCallback(async (city, units) => {
    setLoading(true)
    setError('')
    try {
      const [currentData, forecastData] = await Promise.all([
        fetchCurrentWeatherByCity({ city, units }),
        fetchForecastByCity({ city, units }),
      ])
      setWeather(currentData)
      setForecast(buildFiveDayForecast(forecastData))
      await updateAdvancedMetrics(currentData, forecastData, units)
    } catch (err) {
      setError(err.message || 'Unable to load weather details.')
      setWeather(null)
      setForecast([])
      setHighlights(null)
      setTemperatureTrend([])
    } finally {
      setLoading(false)
    }
  }, [updateAdvancedMetrics])

  const loadByCoords = useCallback(async (lat, lon, units) => {
    setLoading(true)
    setError('')
    try {
      const [currentData, forecastData] = await Promise.all([
        fetchCurrentWeatherByCoords({ lat, lon, units }),
        fetchForecastByCoords({ lat, lon, units }),
      ])
      setWeather(currentData)
      setForecast(buildFiveDayForecast(forecastData))
      await updateAdvancedMetrics(currentData, forecastData, units)
    } catch (err) {
      setError(err.message || 'Unable to load weather details.')
      setWeather(null)
      setForecast([])
      setHighlights(null)
      setTemperatureTrend([])
    } finally {
      setLoading(false)
    }
  }, [updateAdvancedMetrics])

  return {
    weather,
    forecast,
    loading,
    error,
    highlights,
    temperatureTrend,
    radarTileUrl,
    loadByCity,
    loadByCoords,
  }
}
