import { motion } from 'framer-motion'
import { formatVisibility, getUvCategory } from '../utils/weatherHelpers'

const HighlightsCard = ({ highlights, unit }) => {
  if (!highlights) return null

  return (
    <motion.section
      className="glass-card p-6"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <h3 className="mb-4 text-xl font-semibold text-white sm:text-2xl">Today&apos;s Highlights</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <HighlightItem
          label="Rain Probability"
          value={`${highlights.rainProbability}%`}
          tone="from-sky-500/40 to-indigo-500/20"
        />
        <HighlightItem
          label="UV Index"
          value={highlights.uvIndex == null ? 'N/A' : `${highlights.uvIndex}`}
          meta={getUvCategory(highlights.uvIndex)}
          tone="from-amber-500/40 to-orange-500/20"
        />
        <HighlightItem
          label="Pressure"
          value={`${highlights.pressure} hPa`}
          tone="from-emerald-500/30 to-teal-500/20"
        />
        <HighlightItem
          label="Visibility"
          value={formatVisibility(highlights.visibility, unit)}
          tone="from-violet-500/30 to-fuchsia-500/20"
        />
      </div>
    </motion.section>
  )
}

const HighlightItem = ({ label, value, meta, tone }) => (
  <article className={`rounded-xl border border-slate-600 bg-gradient-to-br ${tone} p-4 shadow-sm`}>
    <p className="text-sm text-slate-200">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    {meta ? <p className="mt-1 text-sm text-slate-300">{meta}</p> : null}
  </article>
)

export default HighlightsCard
