export interface WeatherMetNorway {
    type: string
    geometry: Geometry
    properties: Properties
}

export interface Geometry {
    type: string
    coordinates: number[]
}

export interface Properties {
    meta: Meta
    timeseries: Series[]
}

export interface Meta {
    updated_at: string
    units: Units
}

export interface Units {
    air_pressure_at_sea_level: string
    air_temperature: string
    air_temperature_max: string
    air_temperature_min: string
    cloud_area_fraction: string
    cloud_area_fraction_high: string
    cloud_area_fraction_low: string
    cloud_area_fraction_medium: string
    dew_point_temperature: string
    fog_area_fraction: string
    precipitation_amount: string
    relative_humidity: string
    ultraviolet_index_clear_sky: string
    wind_from_direction: string
    wind_speed: string
}

export interface Series {
    time: string
    data: Data
}

export interface Data {
    instant: Instant
    next_12_hours?: Next12Hours
    next_1_hours?: Next1Hours
    next_6_hours?: Next6Hours
}

export interface Instant {
    details: Details
}

export interface Details {
    air_pressure_at_sea_level: number
    air_temperature: number
    cloud_area_fraction: number
    cloud_area_fraction_high: number
    cloud_area_fraction_low: number
    cloud_area_fraction_medium: number
    dew_point_temperature: number
    fog_area_fraction?: number
    relative_humidity: number
    ultraviolet_index_clear_sky?: number
    wind_from_direction: number
    wind_speed: number
}

export interface Summary {
    symbol_code: string
}


export interface Next1Hours {
    summary: Summary
    details: Details
}


export interface Next6Hours {
    summary: Summary
    details: Details
}

export interface Next12Hours {
    summary: Summary
    details: Details
}