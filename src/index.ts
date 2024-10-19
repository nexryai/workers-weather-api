/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { MetNorwayWeatherService } from "./services/weather/WeatherService";


interface Env {
	cache: KVNamespace
}

const weatherService = new(MetNorwayWeatherService)

export default {
	async fetch(request, env, ctx): Promise<Response> {
		let lat = request.cf?.latitude
		let lon = request.cf?.longitude
		let tz = request.cf?.timezone || "Asia/Tokyo"

		if (!lat || !lon) {
			const url = new URL(request.url)
			lat = url.searchParams.get('lat') ?? undefined
			lon = url.searchParams.get('lon') ?? undefined

			if (!lat || !lon) {
				return new Response("error: unable to get location")
			}
		}


		const localtion = `${lat}:${lon}`
		const cacheKey = `weather.${localtion}`

		const exists = await env.cache.get(cacheKey)
		if (exists) {
			return new Response(exists, {
				headers: {
					"Content-Type": "application/json"
				}
			});
		}

		const res = await weatherService.fetchWeather(lat, lon, tz)
		const resString = JSON.stringify(res)

		await env.cache.put(cacheKey, resString, {
			// 30 min
			expirationTtl: 1800
		})

		return new Response(resString, {
			headers: {
				"Content-Type": "application/json"
			}
		})
	},
} satisfies ExportedHandler<Env>;
