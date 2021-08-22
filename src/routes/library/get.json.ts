const db = import.meta.env.VITE_DETA
const URL = import.meta.env.VITE_DETA_URL
export const get = async ({ query }) => {
	const id = query.get('id')
	try {
		const response = await fetch(URL + encodeURIComponent(id), {
			method: 'GET',
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
