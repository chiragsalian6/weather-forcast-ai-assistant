import { motion } from 'framer-motion'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const WeatherRadarMap = ({ weather, radarTileUrl }) => {
  if (!weather || !radarTileUrl) return null

  const center = [weather.coord.lat, weather.coord.lon]

  return (
    <motion.section
      className="glass-card p-6"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white sm:text-2xl">Live Weather Map (Radar)</h3>
        <p className="text-sm text-slate-300">Centered on {weather.name}</p>
      </div>
      <div className="h-80 overflow-hidden rounded-2xl border border-slate-600">
        <MapContainer center={center} zoom={6} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <TileLayer url={radarTileUrl} opacity={0.6} />
        </MapContainer>
      </div>
    </motion.section>
  )
}

export default WeatherRadarMap
