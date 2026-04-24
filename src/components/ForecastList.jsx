import ForecastCard from './ForecastCard'

const ForecastList = ({ forecast, timezoneOffset, unitSymbol }) => {
  if (!forecast.length) return null

  return (
    <section className="glass-card p-6">
      <h3 className="mb-4 text-xl font-semibold text-white sm:text-2xl">5-Day Forecast</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {forecast.map((day, index) => (
          <ForecastCard
            key={day.dt}
            day={day}
            timezoneOffset={timezoneOffset}
            unitSymbol={unitSymbol}
            index={index}
          />
        ))}
      </div>
    </section>
  )
}

export default ForecastList
