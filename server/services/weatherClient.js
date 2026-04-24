import { WEATHER_API_KEY } from '../config.js'

const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5'
const GEO_BASE_URL = 'https://api.openweathermap.org/geo/1.0'

const request = async (baseUrl, path, query = {}) => {
  const url = new URL(`${baseUrl}/${path}`)
  Object.entries({ ...query, appid: WEATHER_API_KEY }).forEach(([k, v]) =>
    url.searchParams.append(k, String(v))
  )

  const response = await fetch(url)
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data?.message || 'OpenWeather request failed.')
  }
  return data
}

export const fetchCurrentByCity = async (city, units = 'metric') =>
  request(WEATHER_BASE_URL, 'weather', { q: city, units })

export const fetchForecastByCity = async (city, units = 'metric') =>
  request(WEATHER_BASE_URL, 'forecast', { q: city, units })

export const fetchCurrentByCoords = async (lat, lon, units = 'metric') =>
  request(WEATHER_BASE_URL, 'weather', { lat, lon, units })

export const fetchForecastByCoords = async (lat, lon, units = 'metric') =>
  request(WEATHER_BASE_URL, 'forecast', { lat, lon, units })

export const fetchAirPollutionByCoords = async (lat, lon) =>
  request(WEATHER_BASE_URL, 'air_pollution', { lat, lon })

export const fetchOneCallByCoords = async (lat, lon, units = 'metric') =>
  request(WEATHER_BASE_URL, 'onecall', {
    lat,
    lon,
    units,
    exclude: 'alerts',
  })

export const geocodeCity = async (city, limit = 5) =>
  request(GEO_BASE_URL, 'direct', { q: city, limit })

export const reverseGeocode = async (lat, lon, limit = 1) =>
  request(GEO_BASE_URL, 'reverse', { lat, lon, limit })
