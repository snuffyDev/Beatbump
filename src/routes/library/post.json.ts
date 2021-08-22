import type { EndpointOutput } from '@sveltejs/kit'
const db = import.meta.env.VITE_DETA
const URL = import.meta.env.VITE_DETA_URL
export const post = async (req) => {
	const { item } = JSON.parse(req.body)
	const body = { item }
	console.log(req, { body })
	try {
		const response = await fetch(`${URL}`, {
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				'Content-Type': 'application/json',
				'X-API-Key': `${db}`
			}
		})
		const data = await response.json()
		console.log(response.statusText)
		if (response.ok) {
			return {
				body: { data, text: response.statusText },
				status: response.status
			}
		}
	} catch (error) {}
}
