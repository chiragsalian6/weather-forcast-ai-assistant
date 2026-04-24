export const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5'
export const ONE_CALL_API_BASE_URL = 'https://api.openweathermap.org/data/3.0'
export const ICON_BASE_URL = 'https://openweathermap.org/img/wn'
export const WEATHER_MAP_TILE_BASE_URL = 'https://tile.openweathermap.org/map'
export const DEFAULT_CITY = 'London'
export const FAVORITES_STORAGE_KEY = 'weather.favorite.cities'
export const UNIT_STORAGE_KEY = 'weather.temperature.unit'

export const UNITS = {
  metric: {
    key: 'metric',
    symbol: 'C',
    speed: 'm/s',
  },
  imperial: {
    key: 'imperial',
    symbol: 'F',
    speed: 'mph',
  },
}
