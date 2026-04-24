import { motion } from 'framer-motion'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const TemperatureChart = ({ data, unitSymbol }) => {
  if (!data.length) return null

  return (
    <motion.section
      className="glass-card p-6"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <h3 className="mb-4 text-xl font-semibold text-white sm:text-2xl">
        Temperature Trends (24h)
      </h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(148,163,184,0.25)" strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="#cbd5e1" />
            <YAxis stroke="#cbd5e1" unit={`°${unitSymbol}`} />
            <Tooltip
              contentStyle={{ background: '#0f172acc', border: '1px solid #334155', borderRadius: 12 }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="temp"
              name="Temperature"
              stroke="#22d3ee"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="feelsLike"
              name="Feels Like"
              stroke="#a78bfa"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  )
}

export default TemperatureChart
