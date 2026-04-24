import { ONE_CALL_API_BASE_URL, WEATHER_API_BASE_URL, WEATHER_MAP_TILE_BASE_URL } from './constants'

export const getApiKey = () => {
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY
  if (!apiKey) {
    throw new Error('Missing API key. Add VITE_WEATHER_API_KEY in your .env file.')
  }
  return apiKey
}

const requestWeather = async (path, queryParams) => {
  const url = new URL(`${WEATHER_API_BASE_URL}/${path}`)
  const apiKey = getApiKey()

  Object.entries({ ...queryParams, appid: apiKey }).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })

  const response = await fetch(url)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.message || 'Weather data could not be loaded.')
  }

  return data
}

const requestOneCall = async (path, queryParams) => {
  const url = new URL(`${ONE_CALL_API_BASE_URL}/${path}`)
  const apiKey = getApiKey()

  Object.entries({ ...queryParams, appid: apiKey }).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })

  const response = await fetch(url)
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data?.message || 'Advanced weather data could not be loaded.')
  }
  return data
}

export const fetchCurrentWeatherByCity = ({ city, units }) =>
  requestWeather('weather', { q: city, units })

export const fetchCurrentWeatherByCoords = ({ lat, lon, units }) =>
  requestWeather('weather', { lat, lon, units })

export const fetchForecastByCity = ({ city, units }) =>
  requestWeather('forecast', { q: city, units })

export const fetchForecastByCoords = ({ lat, lon, units }) =>
  requestWeather('forecast', { lat, lon, units })

export const fetchOneCallByCoords = ({ lat, lon, units }) =>
  requestOneCall('onecall', { lat, lon, units, exclude: 'minutely,alerts' })

export const getRadarTileUrl = (layer = 'precipitation_new') =>
  `${WEATHER_MAP_TILE_BASE_URL}/${layer}/{z}/{x}/{y}.png?appid=${getApiKey()}`
