import type {
	EndpointOutput,
	RequestHandler
} from '@sveltejs/kit/types/endpoint'

export const get: RequestHandler = async ({
	query
}): Promise<EndpointOutput> => {
	const theme = query.get('theme')

	return {
		headers: {
			'set-cookie': `theme=${theme}; Path=/; HttpOnly`
		},
		status: 204
	}
}
