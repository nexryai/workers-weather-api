import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { WeatherForecast } from "../../models/weather";
import { Data, Series, WeatherMetNorway } from "./upstreams/MetNorway";

export interface WeatherService {
    fetchWeather(lat: string, lon: string, tz: string): Promise<WeatherForecast>
}

export class MetNorwayWeatherService implements WeatherService {
    constructor(){
        dayjs.extend(customParseFormat)
        dayjs.extend(utc)
        dayjs.extend(timezone)
    }

    private seekForecast(data: Series[], seekTo: dayjs.Dayjs): Data {
        console.log(seekTo)
        const utcTime = seekTo.utc().format('YYYY-MM-DDTHH:mm:ss[Z]')
        console.log(utcTime)
        return data.find(entry => entry.time === utcTime)?.data!
    }

    private getMaxAndMinTemp(data: Series[], date: dayjs.Dayjs): { max: number, min: number } {
        date = date.set('hour', 0).set('minute', 0).set('second', 0)
        const baseIndex = data.findIndex(
            entry => entry.time === date.utc().format('YYYY-MM-DDTHH:mm:ss[Z]')
        )

        // baseIndex ~ +23の範囲でair_temperatureを取得
        const temperatures = data
            .slice(baseIndex, baseIndex + 23)
            .map(item => item.data.instant.details.air_temperature);

        console.log(temperatures)
        return { 
            max: Math.max(...temperatures), 
            min: Math.min(...temperatures) 
        }
    }

    public async fetchWeather(lat: string, lon: string, tz: string): Promise<WeatherForecast> {
        const req = new Request(`https://api.met.no/weatherapi/locationforecast/2.0?lat=${lat}&lon=${lon}`, {
            headers: {
                "User-Agent": "Workers Wrather API (https://github.com/nexryai/workers-weather-api)",
            },
        })

        const res = await fetch(req)
        const weather = await res.json() as WeatherMetNorway

        // 現在の気温
        const nowTemp = weather.properties.timeseries[0].data.instant.details.air_temperature

        // 現在の時刻によって”今日の天気”として表示される予報の範囲を変更する
        let todayWeatherSymbol: string
        
        const nowHour = dayjs().tz(tz).hour()
        if (nowHour < 8) {
            // 8時より前なら8時から今後12時間の予報を本日の天気とする
            const seekTo = dayjs().tz(tz).set('hour', 6).set('minute', 0).set('second', 0)
            todayWeatherSymbol = this.seekForecast(weather.properties.timeseries, seekTo).next_12_hours?.summary.symbol_code!
        } else if (nowHour < 16) {
            // 16時より前であれば今後12時間の予報を本日の予報とする
            todayWeatherSymbol = weather.properties.timeseries[0].data.next_12_hours?.summary.symbol_code!
        } else {
            // 16時以降なら今後6時間の天気
            todayWeatherSymbol = weather.properties.timeseries[0].data.next_6_hours?.summary.symbol_code!
        }

        let result: WeatherForecast = {
            now_temp: nowTemp,
            today_weather_symbol: todayWeatherSymbol,
            forecasts: []
        }

        for (let d = 1; d < 3; d++) {
            const seekTo = dayjs().tz(tz).add(d, 'day').set('hour', 7).set('minute', 0).set('second', 0)
            const weatherSymbol = this.seekForecast(weather.properties.timeseries, seekTo).next_12_hours?.summary.symbol_code!
            const temp = this.getMaxAndMinTemp(weather.properties.timeseries, seekTo)
            result.forecasts.push({
                date: seekTo.format('YYYY-MM-DD'),
                symbol: weatherSymbol,
                max_temp: temp.max,
                min_temp: temp.min
            })
        }

        return result
    }
}