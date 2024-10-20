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

import Elysia, { Context, error, t } from "elysia";
import { MetNorwayWeatherService } from "./services/weather/WeatherService";


interface Env {
	cache: KVNamespace
}

const weatherService = new(MetNorwayWeatherService)
const app = new Elysia({ aot: false })

// FIXME: cacheがKVNamespaceにならない
//@ts-ignore
app.get("/weather", async ({ cache, request, query }) => {
	let lat = query.lat || request.cf?.latitude as number | undefined
	let lon = query.lon || request.cf?.longitude as number | undefined
	let tz = query.tz || request.cf?.timezone as string | undefined

	if (!lat || !lon || !tz) {
		return error(400, "error: unable to get location or timezone")
	}

	const cacheKey = `weather.${lat}:${lon}`

	const exists = await cache.get(cacheKey)
	if (exists) {
		return new Response(exists, {
			headers: {
				"Content-Type": "application/json"
			}
		});
	}

	const res = await weatherService.fetchWeather(lat, lon, tz)
	const resString = JSON.stringify(res)

	await cache.put(cacheKey, resString, {
		// 30 min
		expirationTtl: 1800
	})

	return new Response(resString, {
		headers: {
			"Content-Type": "application/json"
		}
	})
}, {
	query: t.Object({
		lat: t.Optional(t.Number({
			error: 'lat must be a number'
		})),
		lon: t.Optional(t.Number({
			error: 'lon must be a number'
		})),
		tz: t.Optional(t.String({
			error: 'timezone(tz) must be a string'
		}))
	})
})


export default {
	async fetch(request, env, ctx): Promise<Response> {
		app.decorate({
			cache: env.cache
		})

		return app.fetch(request)
	},
} satisfies ExportedHandler<Env>;
