export enum WeatherSymbolCode {

}

export interface WeatherForecast {
    now_temp: number
    today_weather_symbol: string
    forecasts: Weather[]
}

export interface Weather {
    date: string
    // ToDo: ENUM使う
    symbol: string
    max_temp: number
    min_temp: number
}