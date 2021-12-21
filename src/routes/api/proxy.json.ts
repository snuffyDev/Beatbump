import type { EndpointOutput } from '@sveltejs/kit'
const http = async (url, type, headers) => {
	return fetch(url, { headers })
		.then((response) => {
			if (type === 'blob') {
				return response.blob()
			} else if (type === 'json') {
				return response.json()
			} else {
				return response.arrayBuffer().then((buffer) => {
					const b64 = buffer.toString()
				})
			}
		})
		.catch((err) => console.error(err))
}
export async function get({ query }) {
	const type = query.get('type') || 'arrayBuffer'
	let url: string = query.get('url')
	url = decodeURIComponent(url)
	let headers = {}

	if (url.match(/lh3.google|i.ytimg/gim)) {
		headers = {
			origin: 'https://music.youtube.com/',
			referer: 'https://music.youtube.com/',
			'User-Agent':
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36 Edg/95.0.1020.38'
		}
	}
	const response = await fetch(url, { headers })
	const data = await response.arrayBuffer()
	const raw = Buffer.from(data).toString('base64')
	// console.log(response, data)
	return {
		body: {
			image: 'data:' + 'image/jpeg' + ';base64,' + raw
		},
		status: 200
	}
}
