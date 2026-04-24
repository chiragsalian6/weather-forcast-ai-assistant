import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { SERVER_PORT } from './config.js'
import { withCache } from './cache.js'
import {
  fetchAirPollutionByCoords,
  fetchCurrentByCity,
  fetchCurrentByCoords,
  fetchForecastByCity,
  fetchForecastByCoords,
  geocodeCity,
  reverseGeocode,
} from './services/weatherClient.js'
import {
  classifyOutdoor,
  classifySports,
  classifyTravel,
  detectAnomalies,
  getBestWindow,
} from './services/decisionEngine.js'
import { aiSummary } from './services/aiClient.js'

const app = express()
app.use(cors())
app.use(express.json())
app.use((req, _res, next) => {
  if (req.url.startsWith('/api/')) {
    req.url = req.url.replace('/api', '')
  }
  next()
})

const POPULAR_CITIES = [
  { name: 'Mumbai', state: 'Maharashtra', country: 'IN' },
  { name: 'Delhi', state: 'Delhi', country: 'IN' },
  { name: 'Bengaluru', state: 'Karnataka', country: 'IN' },
  { name: 'Chennai', state: 'Tamil Nadu', country: 'IN' },
  { name: 'Kolkata', state: 'West Bengal', country: 'IN' },
  { name: 'Hyderabad', state: 'Telangana', country: 'IN' },
  { name: 'Pune', state: 'Maharashtra', country: 'IN' },
  { name: 'Ahmedabad', state: 'Gujarat', country: 'IN' },
  { name: 'New York', state: 'NY', country: 'US' },
  { name: 'London', state: '', country: 'GB' },
  { name: 'Dubai', state: '', country: 'AE' },
  { name: 'Singapore', state: '', country: 'SG' },
]

const getBaseDataset = async (city, units = 'metric') =>
  withCache(`base:${city}:${units}`, async () => {
    const [current, forecast] = await Promise.all([
      fetchCurrentByCity(city, units),
      fetchForecastByCity(city, units),
    ])
    const hourly = (forecast.list || []).slice(0, 12)
    const yesterdayProxy = hourly.slice(0, 8).reduce(
      (acc, item) => {
        acc.temp += item.main.temp
        acc.humidity += item.main.humidity
        acc.wind += item.wind.speed
        return acc
      },
      { temp: current.main.temp, humidity: current.main.humidity, wind: current.wind.speed }
    )
    const divider = Math.max(hourly.slice(0, 8).length, 1)
    return {
      city: current.name,
      units,
      current,
      hourly,
      yesterday: {
        temp: yesterdayProxy.temp / divider,
        humidity: yesterdayProxy.humidity / divider,
        wind: yesterdayProxy.wind / divider,
      },
    }
  })

const shapeDataset = (current, forecast, units) => {
  const hourly = (forecast.list || []).slice(0, 12)
  const yesterdayProxy = hourly.slice(0, 8).reduce(
    (acc, item) => {
      acc.temp += item.main.temp
      acc.humidity += item.main.humidity
      acc.wind += item.wind.speed
      return acc
    },
    { temp: current.main.temp, humidity: current.main.humidity, wind: current.wind.speed }
  )
  const divider = Math.max(hourly.slice(0, 8).length, 1)
  return {
    city: current.name,
    units,
    current,
    hourly,
    yesterday: {
      temp: yesterdayProxy.temp / divider,
      humidity: yesterdayProxy.humidity / divider,
      wind: yesterdayProxy.wind / divider,
    },
  }
}

const getBaseDatasetByCoords = async (lat, lon, units = 'metric') =>
  withCache(`base:${lat}:${lon}:${units}`, async () => {
    const [current, forecast] = await Promise.all([
      fetchCurrentByCoords(lat, lon, units),
      fetchForecastByCoords(lat, lon, units),
    ])
    return shapeDataset(current, forecast, units)
  })

app.get('/weather', async (req, res) => {
  try {
    const city = req.query.city || 'Bengaluru'
    const units = req.query.units || 'metric'
    const data = await getBaseDataset(city, units)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/weather/by-coords', async (req, res) => {
  try {
    const lat = Number(req.query.lat)
    const lon = Number(req.query.lon)
    const units = req.query.units || 'metric'
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({ error: 'lat and lon are required numeric query parameters.' })
    }
    const data = await getBaseDatasetByCoords(lat, lon, units)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/city-suggestions', async (req, res) => {
  try {
    const query = String(req.query.query || '').trim()
    if (query.length < 2) return res.json({ suggestions: [] })
    const candidates = await geocodeCity(query, 8)
    const normalizedQuery = query.toLowerCase()
    const apiSuggestions = candidates
      .filter((item) => String(item.name || '').toLowerCase().startsWith(normalizedQuery))
      .map((item) => ({
        name: item.name,
        state: item.state || '',
        country: item.country || '',
        lat: item.lat,
        lon: item.lon,
        label: [item.name, item.state, item.country].filter(Boolean).join(', '),
      }))

    const popularMatches = POPULAR_CITIES.filter((item) =>
      item.name.toLowerCase().startsWith(normalizedQuery)
    ).map((item) => ({
      ...item,
      lat: null,
      lon: null,
      label: [item.name, item.state, item.country].filter(Boolean).join(', '),
    }))

    const merged = [...popularMatches, ...apiSuggestions].reduce((acc, item) => {
      if (!acc.some((a) => a.label.toLowerCase() === item.label.toLowerCase())) acc.push(item)
      return acc
    }, [])

    res.json({ suggestions: merged.slice(0, 6) })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/reverse-geocode', async (req, res) => {
  try {
    const lat = Number(req.query.lat)
    const lon = Number(req.query.lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({ error: 'lat and lon are required numeric query parameters.' })
    }
    const result = await reverseGeocode(lat, lon, 1)
    res.json({ location: result?.[0] || null })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/decision-ai', async (req, res) => {
  try {
    const city = req.query.city || 'Bengaluru'
    const units = req.query.units || 'metric'
    const data = await getBaseDataset(city, units)
    const outsideWindow = getBestWindow(data.hourly, (h) => classifyOutdoor(h) === 'YES')
    const sportsWindow = getBestWindow(data.hourly, (h) => classifySports(h) === 'Good')
    const travel = classifyTravel(data.hourly[0])
    const decision = {
      goOutside: { verdict: classifyOutdoor(data.hourly[0]), bestWindow: outsideWindow },
      travel,
      sports: { verdict: classifySports(data.hourly[0]), bestWindow: sportsWindow },
    }
    const summary = await aiSummary(
      'You are a weather decision assistant. Explain decisions in crisp actionable language.',
      { city: data.city, decision },
      `${data.city}: Go outside ${decision.goOutside.verdict}. Travel ${decision.travel.verdict}. Sports ${decision.sports.verdict}.`
    )
    res.json({ ...decision, summary })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/ai-insights', async (req, res) => {
  try {
    const city = req.query.city || 'Bengaluru'
    const units = req.query.units || 'metric'
    const data = await getBaseDataset(city, units)
    const insights = {
      outside: getBestWindow(data.hourly, (h) => classifyOutdoor(h) === 'YES'),
      jogging: getBestWindow(data.hourly, (h) => classifySports(h) === 'Good' && h.main.temp < 30),
      warning:
        data.hourly.find((h) => h.pop > 0.6)?.dt_txt || 'No major travel warning in next 24 hours',
    }
    const summary = await aiSummary(
      'Summarize weather insights with explicit time windows and warnings.',
      { city: data.city, insights },
      `Best outside: ${insights.outside}. Best jogging: ${insights.jogging}. Warning: ${insights.warning}.`
    )
    res.json({ insights, summary })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/compare-cities', async (req, res) => {
  try {
    const cityA = req.query.cityA || 'Bengaluru'
    const cityB = req.query.cityB || 'Mumbai'
    const units = req.query.units || 'metric'
    const [a, b] = await Promise.all([getBaseDataset(cityA, units), getBaseDataset(cityB, units)])
    const [aqA, aqB] = await Promise.all([
      fetchAirPollutionByCoords(a.current.coord.lat, a.current.coord.lon),
      fetchAirPollutionByCoords(b.current.coord.lat, b.current.coord.lon),
    ])
    const comparison = {
      cityA: a.city,
      cityB: b.city,
      tempDiff: a.current.main.temp - b.current.main.temp,
      rainDiff: (a.hourly[0]?.pop || 0) * 100 - (b.hourly[0]?.pop || 0) * 100,
      aqiA: aqA?.list?.[0]?.main?.aqi ?? null,
      aqiB: aqB?.list?.[0]?.main?.aqi ?? null,
      cooler: a.current.main.temp <= b.current.main.temp ? a.city : b.city,
      lessRain: (a.hourly[0]?.pop || 1) <= (b.hourly[0]?.pop || 1) ? a.city : b.city,
    }
    const summary = await aiSummary(
      'Write a short city comparison for weather decisions.',
      comparison,
      `Cooler city: ${comparison.cooler}. Less rain: ${comparison.lessRain}.`
    )
    res.json({ comparison, summary })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/packing', async (req, res) => {
  try {
    const { city = 'Bengaluru', date, units = 'metric' } = req.body || {}
    const data = await getBaseDataset(city, units)
    const items = []
    const temp = data.current.main.temp
    const rain = (data.hourly[0]?.pop || 0) * 100
    if (temp > 30) items.push('Light breathable clothes', 'Sunscreen', 'Water bottle')
    if (temp < 15) items.push('Light jacket')
    if (rain > 40) items.push('Umbrella', 'Quick-dry shoes')
    if (data.current.wind.speed > 9) items.push('Windproof layer')
    const summary = await aiSummary(
      'Provide concise packing guidance with weather reasoning.',
      { city: data.city, date, temp, rain, items },
      `For ${city} on ${date || 'selected date'}: ${items.join(', ')}.`
    )
    res.json({ city: data.city, date, items: [...new Set(items)], summary })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/health', async (req, res) => {
  try {
    const city = req.query.city || 'Bengaluru'
    const units = req.query.units || 'metric'
    const data = await getBaseDataset(city, units)
    const alerts = []
    if (data.current.main.humidity > 80) alerts.push('High humidity may increase fatigue risk.')
    if (data.current.main.temp > 34) alerts.push('Heat stress risk: hydrate frequently.')
    if (data.current.wind.speed > 10) alerts.push('Strong winds: avoid prolonged outdoor exposure.')
    if (data.current.main.temp < 10) alerts.push('Cold stress risk: wear layered clothing outdoors.')
    if (alerts.length === 0) {
      alerts.push('Weather is generally comfortable. Maintain normal hydration and sun protection.')
    }
    const summary = await aiSummary(
      'Return practical health advice for current weather.',
      { city: data.city, alerts },
      `${data.city}: ${alerts.join(' ')}`
    )
    res.json({ alerts, summary })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/trend-analysis', async (req, res) => {
  try {
    const city = req.query.city || 'Bengaluru'
    const units = req.query.units || 'metric'
    const data = await getBaseDataset(city, units)
    const trend = data.hourly.map((h) => ({
      time: h.dt_txt.slice(11, 16),
      temperature: Number(h.main.temp.toFixed(1)),
      yesterdayProxy: Number(data.yesterday.temp.toFixed(1)),
    }))
    const anomalies = detectAnomalies(data.hourly)
    const delta = Number((data.current.main.temp - data.yesterday.temp).toFixed(1))
    const summary = await aiSummary(
      'Analyze weather trend versus yesterday and mention anomalies.',
      { city: data.city, delta, anomalies },
      `${data.city} is ${delta >= 0 ? '+' : ''}${delta}°C vs yesterday.`
    )
    res.json({ trend, anomalies, delta, summary })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/micro-forecast', async (req, res) => {
  try {
    const city = req.query.city || 'Bengaluru'
    const units = req.query.units || 'metric'
    const data = await getBaseDataset(city, units)
    const feelsHotter = data.current.main.humidity > 70 && data.current.wind.speed < 4
    const rainSoon = (data.hourly[0]?.pop || 0) > 0.4
    const insight = {
      feels: feelsHotter ? 'Feels hotter due to high humidity and low wind.' : 'Feels near actual temperature.',
      rain30m: rainSoon ? 'Chance of rain in next 30-60 minutes is elevated.' : 'Low immediate rain probability.',
    }
    const summary = await aiSummary(
      'Summarize micro-forecast insights in two lines.',
      { city: data.city, insight },
      `${insight.feels} ${insight.rain30m}`
    )
    res.json({ insight, summary })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

if (!process.env.VERCEL) {
  app.listen(SERVER_PORT, () => {
    console.log(`AI weather API running on http://localhost:${SERVER_PORT}`)
  })
}

export default app
