// OpenWeatherMap wrappers. Server-only -- OPENWEATHERMAP_API_KEY must never
// reach the client bundle. Exposes:
//   - fetchWeatherAtCoordinates: single point-in-time reading (used by the
//     POST /api/applications weather snapshot path).
//   - fetchForecastAtCoordinates: aggregated 5-day forecast (used by
//     GET /api/weather for the manager dashboard + contractor form widgets).
//   - sprayWindowFor / computeSprayWindow: product-agnostic spray-window
//     classifier (good / marginal / poor). Product-specific warnings (against
//     the actual product label) are computed client-side; this is the
//     general "should I be spraying today" signal.

const OWM_CURRENT = 'https://api.openweathermap.org/data/2.5/weather'
const OWM_FORECAST = 'https://api.openweathermap.org/data/2.5/forecast'

export type SprayWindow = 'good' | 'marginal' | 'poor'

export interface WeatherData {
  wind_speed: number
  wind_direction: number
  temperature: number
  humidity: number
  conditions: string
}

export interface CurrentConditions extends WeatherData {
  feels_like: number
  updated_at: string
}

export interface ForecastDay {
  date: string
  high: number
  low: number
  conditions: string
  wind_speed: number
  spray_window: SprayWindow
}

interface OWMCurrentResponse {
  wind?: { speed?: number; deg?: number }
  main?: { temp?: number; humidity?: number; feels_like?: number }
  weather?: Array<{ main?: string }>
}

interface OWMForecastEntry {
  dt: number
  main?: { temp?: number; temp_min?: number; temp_max?: number }
  wind?: { speed?: number }
  weather?: Array<{ main?: string }>
}

interface OWMForecastResponse {
  list?: OWMForecastEntry[]
}

function getKey(): string {
  const key = process.env.OPENWEATHERMAP_API_KEY
  if (!key) throw new Error('OPENWEATHERMAP_API_KEY is not set')
  return key
}

export async function fetchWeatherAtCoordinates(lat: number, lng: number): Promise<WeatherData> {
  const url = `${OWM_CURRENT}?lat=${lat}&lon=${lng}&appid=${getKey()}&units=imperial`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`OpenWeatherMap responded ${res.status}`)
  const data = (await res.json()) as OWMCurrentResponse
  const speed = data.wind?.speed
  const temp = data.main?.temp
  const humidity = data.main?.humidity
  if (typeof speed !== 'number' || typeof temp !== 'number' || typeof humidity !== 'number') {
    throw new Error('Unexpected OpenWeatherMap response shape')
  }
  return {
    wind_speed: Math.round(speed * 10) / 10,
    wind_direction: data.wind?.deg ?? 0,
    temperature: Math.round(temp * 10) / 10,
    humidity,
    conditions: data.weather?.[0]?.main ?? 'Unknown',
  }
}

export async function fetchCurrentConditions(lat: number, lng: number): Promise<CurrentConditions> {
  const url = `${OWM_CURRENT}?lat=${lat}&lon=${lng}&appid=${getKey()}&units=imperial`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`OpenWeatherMap responded ${res.status}`)
  const data = (await res.json()) as OWMCurrentResponse
  const speed = data.wind?.speed
  const temp = data.main?.temp
  const humidity = data.main?.humidity
  const feels = data.main?.feels_like
  if (typeof speed !== 'number' || typeof temp !== 'number' || typeof humidity !== 'number') {
    throw new Error('Unexpected OpenWeatherMap response shape')
  }
  return {
    wind_speed: Math.round(speed * 10) / 10,
    wind_direction: data.wind?.deg ?? 0,
    temperature: Math.round(temp * 10) / 10,
    humidity,
    conditions: data.weather?.[0]?.main ?? 'Unknown',
    feels_like: typeof feels === 'number' ? Math.round(feels * 10) / 10 : Math.round(temp * 10) / 10,
    updated_at: new Date().toISOString(),
  }
}

export async function fetchForecastAtCoordinates(lat: number, lng: number): Promise<ForecastDay[]> {
  const url = `${OWM_FORECAST}?lat=${lat}&lon=${lng}&appid=${getKey()}&units=imperial`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`OpenWeatherMap forecast responded ${res.status}`)
  const data = (await res.json()) as OWMForecastResponse
  const list = data.list ?? []
  return aggregateForecast(list)
}

interface DayBucket {
  date: Date
  temps: number[]
  winds: number[]
  conditions: string[]
}

function aggregateForecast(list: OWMForecastEntry[]): ForecastDay[] {
  const buckets = new Map<string, DayBucket>()
  for (const e of list) {
    const d = new Date(e.dt * 1000)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    let b = buckets.get(key)
    if (!b) {
      b = { date: new Date(d.getFullYear(), d.getMonth(), d.getDate()), temps: [], winds: [], conditions: [] }
      buckets.set(key, b)
    }
    if (typeof e.main?.temp === 'number') b.temps.push(e.main.temp)
    if (typeof e.main?.temp_min === 'number') b.temps.push(e.main.temp_min)
    if (typeof e.main?.temp_max === 'number') b.temps.push(e.main.temp_max)
    if (typeof e.wind?.speed === 'number') b.winds.push(e.wind.speed)
    const cond = e.weather?.[0]?.main
    if (cond) b.conditions.push(cond)
  }
  return Array.from(buckets.values())
    .slice(0, 5)
    .map((b): ForecastDay => {
      const high = b.temps.length ? Math.max(...b.temps) : 0
      const low = b.temps.length ? Math.min(...b.temps) : 0
      const wind = b.winds.length ? Math.max(...b.winds) : 0
      const conditions = mostCommon(b.conditions) ?? 'Unknown'
      return {
        date: b.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        high: Math.round(high),
        low: Math.round(low),
        conditions,
        wind_speed: Math.round(wind * 10) / 10,
        spray_window: computeSprayWindow(wind, high, low),
      }
    })
}

function mostCommon(values: string[]): string | undefined {
  if (values.length === 0) return undefined
  const counts = new Map<string, number>()
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
  let best: string | undefined
  let bestN = -1
  for (const [v, n] of counts) {
    if (n > bestN) {
      best = v
      bestN = n
    }
  }
  return best
}

// Product-agnostic "should I be spraying today" classifier.
// Thresholds per Module 5.8 spec:
//   good: wind < 8 mph AND temp 45-85F
//   marginal: wind 8-12 mph OR temp at the edges (35-45 / 85-95)
//   poor: wind > 12 mph OR temp out of range
export function computeSprayWindow(wind: number, high: number, low: number): SprayWindow {
  if (wind > 12 || high > 95 || low < 35) return 'poor'
  if (wind >= 8 || high > 85 || low < 45) return 'marginal'
  return 'good'
}

export function sprayWindowFor(current: { wind_speed: number; temperature: number }): SprayWindow {
  return computeSprayWindow(current.wind_speed, current.temperature, current.temperature)
}
