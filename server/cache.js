import NodeCache from 'node-cache'

export const weatherCache = new NodeCache({
  stdTTL: 600,
  checkperiod: 120,
  useClones: true,
})

export const withCache = async (key, resolver) => {
  const cached = weatherCache.get(key)
  if (cached) return cached
  const data = await resolver()
  weatherCache.set(key, data)
  return data
}
