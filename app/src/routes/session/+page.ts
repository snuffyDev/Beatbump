import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { IsoBase64 } from "$lib/utils/buffer";

export const load: PageLoad = async ({ url }) => {
	const decoded_token = IsoBase64.fromBase64(decodeURIComponent(url.searchParams.get("token")));
	/// expected format ...   {id: string, displayName: string}
	try {
		const { clientId: host_id, displayName: host_display_name } = JSON.parse(decoded_token);
		return {
			hostId: host_id,
			hostDisplayName: host_display_name,
			url: url.pathname + `?${url.searchParams.toString()}`,
		};
	} catch (error) {
		throw error(500, error);
	}
};
