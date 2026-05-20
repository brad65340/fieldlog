import type { ComplianceStatus, UserRole } from '@/constants'

export interface Operation {
  id: string
  name: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  operation_id: string
  role: UserRole
  first_name: string
  last_name: string
  email: string
  created_at: string
  updated_at: string
}

export interface Field {
  id: string
  operation_id: string
  name: string
  acreage: number | null
  lat: number | null
  lng: number | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  epa_reg_number: string
  active_ingredient: string | null
  restricted_use: boolean
  max_wind_speed: number | null
  min_temp: number | null
  max_temp: number | null
  re_entry_interval_hours: number | null
  pre_harvest_interval_days: number | null
  max_rate_per_acre: number | null
  rate_unit: string
  signal_word: string | null
  epa_label_url: string | null
  sds_url: string | null
  use_classification: string | null
  application_method: string | null
  target_pests: string[] | null
  compatible_crops: string[] | null
  created_at: string
}

export interface Application {
  id: string
  operation_id: string
  contractor_id: string
  field_id: string
  product_id: string
  rate_applied: number
  rate_unit: string
  acreage_treated: number
  target_pest: string | null
  application_start: string
  application_end: string | null
  lat: number | null
  lng: number | null
  compliance_status: ComplianceStatus
  compliance_flags: string[] | null
  notes: string | null
  submitted_at: string
  created_at: string
}

export interface WeatherSnapshot {
  id: string
  application_id: string
  wind_speed: number | null
  wind_direction: number | null
  temperature: number | null
  humidity: number | null
  conditions: string | null
  captured_at: string
  source: string
}

export interface ApplicationWithRelations extends Application {
  profiles: Profile
  fields: Field
  products: Product
  weather_snapshots: WeatherSnapshot | null
}
