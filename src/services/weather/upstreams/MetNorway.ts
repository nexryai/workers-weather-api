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
    timeseries: Series[]
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
    air_temperature: number
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