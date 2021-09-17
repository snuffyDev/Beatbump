type APIResponse = {
	body?: Record<
		string,
		string & number & Record<string & number & symbol, string> & []
	> &
		string
	status: number
	ok: boolean
}
type Fetch = (input: RequestInfo, init?: RequestInit) => Promise<Response>
export async function api(
	fetch: Fetch,
	endpoint: string,
	params?: [] | Record<string, string | number>
): Promise<APIResponse> {
	const urlParams = Object.keys(params)
		.map((k) => {
			if (params[k] == undefined) return
			return k + '=' + params[k]
		})

		.join('&')
	// console.log(urlParams, endpoint, params, `/api/${endpoint}.json?${urlParams}`)
	const response = await fetch(`/api/${endpoint}.json?${urlParams}`, {
		method: 'GET'
	})
	const data = await response.json()
	if (!response.ok) {
		return {
			body: response.statusText,
			status: response.status,
			ok: response.ok
		}
	}
	return {
		body: data,
		status: response.status,
		ok: response.ok
	}
}
