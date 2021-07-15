export async function handle({ request, resolve }) {
	request.locals = request.headers

	const response = await resolve(request)

	return {
		...response,
		headers: {
			...response.headers
		}
	}
}
