// OpenWeatherMap Current Weather API wrapper. Server-only.
// API key (OPENWEATHERMAP_API_KEY) must never reach the client bundle.

const OWM_ENDPOINT = 'https://api.openweathermap.org/data/2.5/weather'

export interface WeatherData {
  wind_speed: number      // mph
  wind_direction: number  // degrees, 0-360
  temperature: number     // fahrenheit
  humidity: number        // percent, 0-100
  conditions: string      // e.g. "Clear", "Clouds", "Rain"
}

interface OpenWeatherMapResponse {
  wind?: { speed?: number; deg?: number }
  main?: { temp?: number; humidity?: number }
  weather?: Array<{ main?: string }>
}

export async function fetchWeatherAtCoordinates(
  lat: number,
  lng: number
): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY
  if (!apiKey) {
    throw new Error('OPENWEATHERMAP_API_KEY is not set')
  }

  const url = `${OWM_ENDPOINT}?lat=${lat}&lon=${lng}&appid=${apiKey}&units=imperial`
  const res = await fetch(url, { cache: 'no-store' })

  if (!res.ok) {
    throw new Error(`OpenWeatherMap responded ${res.status}`)
  }

  const data = (await res.json()) as OpenWeatherMapResponse
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
