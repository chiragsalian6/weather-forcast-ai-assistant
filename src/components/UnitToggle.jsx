import { UNITS } from '../utils/constants'

const UnitToggle = ({ unit, onChange }) => (
  <div
    className="inline-flex rounded-2xl border border-slate-600 bg-slate-800 p-1"
    role="radiogroup"
    aria-label="Temperature unit"
  >
    {Object.values(UNITS).map((option) => (
      <button
        key={option.key}
        onClick={() => onChange(option.key)}
        role="radio"
        aria-checked={option.key === unit}
        className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
          option.key === unit
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-200 hover:bg-slate-700'
        }`}
      >
        °{option.symbol}
      </button>
    ))}
  </div>
)

export default UnitToggle
