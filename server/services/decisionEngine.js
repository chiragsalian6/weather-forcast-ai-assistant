const safeNumber = (value, fallback = 0) => (Number.isFinite(value) ? value : fallback)

export const getRainProbability = (entry) => safeNumber(entry?.pop, 0) * 100

export const classifyOutdoor = (entry) => {
  const temp = safeNumber(entry?.main?.temp)
  const humidity = safeNumber(entry?.main?.humidity)
  const wind = safeNumber(entry?.wind?.speed)
  const rain = getRainProbability(entry)

  if (rain > 60 || wind > 12 || temp > 38 || temp < 5) return 'NO'
  if (rain > 35 || humidity > 90 || wind > 9) return 'CAUTION'
  return 'YES'
}

export const classifyTravel = (entry) => {
  const rain = getRainProbability(entry)
  const visibility = safeNumber(entry?.visibility, 10000)
  const wind = safeNumber(entry?.wind?.speed)

  if (rain > 70 || visibility < 3000 || wind > 14) {
    return { verdict: 'Delay', reason: 'Heavy rain/wind or low visibility risk.' }
  }
  if (rain > 45 || wind > 10) {
    return { verdict: 'Caution', reason: 'Moderate weather risk on route.' }
  }
  return { verdict: 'Safe', reason: 'Low rain and manageable wind.' }
}

export const classifySports = (entry) => {
  const temp = safeNumber(entry?.main?.temp)
  const rain = getRainProbability(entry)
  const wind = safeNumber(entry?.wind?.speed)

  if (rain > 60 || wind > 12 || temp > 36 || temp < 8) return 'Avoid'
  if (rain > 30 || wind > 9 || temp > 32) return 'Moderate'
  return 'Good'
}

export const detectAnomalies = (hourly) => {
  if (!hourly?.length) return []
  const temps = hourly.map((h) => safeNumber(h.main?.temp))
  const avg = temps.reduce((a, b) => a + b, 0) / temps.length
  return hourly
    .filter((h) => Math.abs(safeNumber(h.main?.temp) - avg) >= 4)
    .map((h) => ({
      time: h.dt_txt,
      message:
        h.main.temp > avg ? 'Unusual heat detected at this hour.' : 'Unusual cooling detected at this hour.',
    }))
}

export const getBestWindow = (hourly, predicate) => {
  const good = hourly.filter(predicate)
  if (!good.length) return 'No good window today'
  const first = good[0].dt_txt?.slice(11, 16)
  const last = good[good.length - 1].dt_txt?.slice(11, 16)
  return `${first} - ${last}`
}
