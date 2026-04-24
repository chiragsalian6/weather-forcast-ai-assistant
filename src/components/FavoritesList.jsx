const FavoritesList = ({ favorites, onSelectFavorite, onRemoveFavorite }) => {
  if (!favorites.length) return null

  return (
    <section className="glass-card p-6">
      <h3 className="mb-4 text-xl font-semibold text-white sm:text-2xl">Favorite Cities</h3>
      <div className="flex flex-wrap gap-2">
        {favorites.map((city) => (
          <div key={city} className="flex items-center gap-1">
            <button
              onClick={() => onSelectFavorite(city)}
              className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-sm text-slate-100 transition hover:bg-slate-700"
            >
              {city}
            </button>
            <button
              onClick={() => onRemoveFavorite(city)}
              aria-label={`Remove ${city} from favorites`}
              className="rounded-full border border-red-400/60 px-2 py-1 text-xs text-red-300 transition hover:bg-red-500/20"
            >
              x
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

export default FavoritesList
