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

interface Env {
	cache: KVNamespace;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const exists = await env.cache.get("msg")
		if (exists) {
			return new Response("exists");
		}

		if (request.cf?.latitude || !request.cf?.longitude) {
			return new Response("error");
		}

		const localtion = request.cf.latitude + request.cf.longitude
		await env.cache.put("msg", localtion, {
			expirationTtl: 60
		})
		
		const str = await env.cache.get("msg")
		return new Response(str);
	},
} satisfies ExportedHandler<Env>;
