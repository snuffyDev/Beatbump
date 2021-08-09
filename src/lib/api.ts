type APIResponse = {
	body?: Record<
		string,
		string | number | Record<string | number | symbol, string> | []
	>
	status: number
	ok: boolean
}

export async function api(
	endpoint: string,
	params?: [] | Record<string, string | number>
): Promise<APIResponse> {
	const urlParams = Object.keys(params)
		.map((k) => {
			if (params[k] == undefined) return
			return k + '=' + params[k]
		})

		.join('&')
	const response = await fetch(`/api/${endpoint}.json?${urlParams}`)
	const data = await response.json()

	return {
		body: data,
		status: response.status,
		ok: response.ok
	}
}
