type Fetch = (input: RequestInfo, init?: RequestInit) => Promise<Response>
type APIResponse = {
	body?: string | Record<string, any>
	status: number
	ok: boolean
}

export async function api(
	fetch: Fetch,
	endpoint: string,
	params?: [] | Record<string, string | number>
): Promise<APIResponse> {
	// Turn Object's Key-Value pairs into string
	const urlParams = Object.keys(params)
		.map((k) => {
			if (params[k] == undefined) return
			return k + '=' + params[k]
		})
		.join('&')
	// Make fetch call
	const response = await fetch(`/api/${endpoint}.json?${urlParams}`, {
		method: 'GET'
	})
	const data = await response.json()
	// If request fails, return error.
	if (!response.ok) {
		return {
			body: response.statusText,
			status: response.status,
			ok: response.ok
		}
	}

	// Return successful response.
	return {
		body: data,
		status: response.status,
		ok: response.ok
	}
}
