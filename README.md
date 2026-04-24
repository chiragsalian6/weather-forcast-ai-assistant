# Weather AI Assistant Platform

Full-stack AI-powered weather decision system built with React + Tailwind + Express + OpenWeatherMap + LLM summaries.

## What it does

- Decision AI (outside/travel/sports verdicts + best windows)
- AI Insights (best time recommendations + warnings)
- AI Trend Analysis (chart + anomaly detection + summary)
- Weather vs Yesterday comparison metrics
- Smart Packing Assistant (date-aware recommendations)
- Health Impact alerts
- Compare Cities AI (temperature/rain/air quality)
- Micro Forecast AI (hyper-local style weather reasoning)

## Environment

Create `.env` in project root:

```env
WEATHER_API_KEY=your_openweather_api_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
VITE_WEATHER_API_KEY=your_openweather_api_key
```

`OPENAI_API_KEY` is optional (app falls back to deterministic summaries if absent).

## Run

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8787`

## API endpoints

- `GET /weather`
- `GET /decision-ai`
- `GET /ai-insights`
- `GET /compare-cities`
- `POST /packing`
- `GET /health`
- `GET /trend-analysis`
- `GET /micro-forecast`
