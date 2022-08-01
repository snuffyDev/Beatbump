import { goto } from "$app/navigation";

export const browseHandler = (pageType: string, browseId: string): void => {
	if (pageType.includes("ARTIST")) {
		goto(`/artist/${browseId}`);
	} else {
		pageType.includes("PLAYLIST")
			? goto("/playlist/" + browseId)
			: goto("/release?type=" + encodeURIComponent(pageType) + "&id=" + encodeURIComponent(browseId));
	}
};
