import { Weather } from "../../models/weather";
import { WeatherMetNorway } from "./upstreams/MetNorway";

export interface WeatherService {
    fetchWeather(lat: string, lon: string, tz: string): Promise<Weather>
}

export class MetNorwayWeatherService implements WeatherService {
    public async fetchWeather(lat: string, lon: string, tz: string): Promise<Weather> {
        const req = new Request(`https://api.met.no/weatherapi/locationforecast/2.0?lat=${lat}&lon=${lon}`, {
            headers: {
                "User-Agent": "Workers Wrather API (https://github.com/nexryai/workers-weather-api)",
            },
        })

        const res = await fetch(req)

        // ToDo: 現状のデータは扱いにくいので扱いやすいように整形する
        const weather = res as unknown as WeatherMetNorway
    }
}