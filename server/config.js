export const SERVER_PORT = Number(process.env.PORT || 8787)
export const WEATHER_API_KEY = process.env.WEATHER_API_KEY || process.env.VITE_WEATHER_API_KEY
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY
export const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

if (!WEATHER_API_KEY) {
  throw new Error('Missing WEATHER_API_KEY (or VITE_WEATHER_API_KEY) in environment.')
}
