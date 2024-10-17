export enum WeatherSymbolCode {

}

export interface WeatherForecast {
    now_temp: string
    today_weather_symbol: string
    forecasts: Weather[]
}

export interface Weather {
    date: string
    // ToDo: ENUM使う
    symbol: string
    max_temp: string
    min_temp: string
}