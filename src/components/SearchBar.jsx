import { useState } from 'react'
import { motion } from 'framer-motion'

const SearchBar = ({ onSearch, onUseCurrentLocation }) => {
  const [city, setCity] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!city.trim()) return
    onSearch(city.trim())
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="glass-card flex w-full flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      role="search"
      aria-label="Search weather by city"
    >
      <label htmlFor="city-search" className="sr-only">
        City name
      </label>
      <input
        id="city-search"
        type="text"
        value={city}
        onChange={(event) => setCity(event.target.value)}
        placeholder="Search by city..."
        autoComplete="off"
        className="w-full rounded-2xl border border-slate-600 bg-slate-800 px-4 py-3 text-slate-100 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
      />
      <button
        type="submit"
        className="rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500"
      >
        Search
      </button>
      <button
        type="button"
        onClick={onUseCurrentLocation}
        className="rounded-2xl border border-slate-600 bg-slate-800 px-4 py-3 font-semibold text-slate-100 transition hover:bg-slate-700"
      >
        Use Location
      </button>
    </motion.form>
  )
}

export default SearchBar
