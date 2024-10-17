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

import { WeatherMetNorway } from "./upstreams/MetNorway";

interface Env {
	cache: KVNamespace
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		let lat = request.cf?.latitude
		let lon = request.cf?.longitude

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

		const req = new Request(`https://api.met.no/weatherapi/locationforecast/2.0?lat=${lat}&lon=${lon}`, {
			headers: {
				"User-Agent": "Workers Wrather API (https://github.com/nexryai/workers-weather-api)",
			},
		})

		const res = await fetch(req)

		// ToDo: 現状のデータは扱いにくいので扱いやすいように整形する
		const weather = res as unknown as WeatherMetNorway
		const resString = await res.text()

		await env.cache.put(cacheKey, resString, {
			// 30 min
			expirationTtl: 1800
		})

		return new Response(JSON.stringify(weather), {
			headers: {
				"Content-Type": "application/json"
			}
		})
	},
} satisfies ExportedHandler<Env>;
