export function createShare({
	origin,
	title,
	type = null,
	id,
}: {
	origin: string;
	type?: "MUSIC_PAGE_TYPE_PLAYLIST" | "MUSIC_PAGE_TYPE_ARTIST" | "MUSIC_PAGE_TYPE_ALBUM" | "SESSION" | null;
	id: string;
	title?: string;
}): { url: string; title: string } {
	switch (type) {
		case "MUSIC_PAGE_TYPE_ALBUM":
			return { url: `${origin}/release?id=${id}`, title };
		case "MUSIC_PAGE_TYPE_ARTIST":
			return { title, url: `${origin}/artist/${id}` };
		case "MUSIC_PAGE_TYPE_PLAYLIST":
			return { title, url: `${origin}/playlist/${id}` };
		case "SESSION":
			return { title, url: `${origin}/session?token=${id}` };
		default:
			return { url: `${origin}/listen?id=${id}`, title };
	}
}
