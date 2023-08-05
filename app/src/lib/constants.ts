export const IMAGE_NOT_FOUND =
	"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSJpc29sYXRpb246aXNvbGF0ZSIgdmlld0JveD0iMCAwIDI1NiAyNTYiIHdpZHRoPSIyNTZwdCIgaGVpZ2h0PSIyNTZwdCI+PGRlZnM+PGNsaXBQYXRoIGlkPSJwcmVmaXhfX2EiPjxwYXRoIGQ9Ik0wIDBoMjU2djI1NkgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNwcmVmaXhfX2EpIj48cGF0aCBmaWxsPSIjNDI0MjQyIiBkPSJNMCAwaDI1NnYyNTZIMHoiLz48ZyBjbGlwLXBhdGg9InVybCgjcHJlZml4X19iKSI+PHRleHQgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTA1LjU0IDE2Ni43OTQpIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLC1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LCZxdW90O1NlZ29lIFVJJnF1b3Q7LFJvYm90byxPeHlnZW4sVWJ1bnR1LENhbnRhcmVsbCwmcXVvdDtPcGVuIFNhbnMmcXVvdDssJnF1b3Q7SGVsdmV0aWNhIE5ldWUmcXVvdDssc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjQwMCIgZm9udC1zaXplPSIxMDAiIGZpbGw9IiNmYWZhZmEiPj88L3RleHQ+PC9nPjxkZWZzPjxjbGlwUGF0aCBpZD0icHJlZml4X19iIj48cGF0aCB0cmFuc2Zvcm09InRyYW5zbGF0ZSg5MiA1NC44MzkpIiBkPSJNMCAwaDcydjE0Ni4zMjNIMHoiLz48L2NsaXBQYXRoPjwvZGVmcz48L2c+PC9zdmc+";

export const FINITE_LIST_PARAMS = "wAEB8gECeAE%3D";

/**
 * These are the parameters that are needed for the list endpoint.
 * The next property is a base64 encoded string that contains a cursor.
 * This cursor is used to get the next set of results.
 */
export const APIParams = {
	finite: FINITE_LIST_PARAMS,
	next: encodeURIComponent("OAHyAQIIAQ=="),
	lt100: "8gECGAM%3D",
} as const;

// This code takes in a string that is an ID and a type. It then returns a string that is the ID prefixed with the correct identifier. The identifier is determined by the type. The type is a string that is the name of a property in the PLAYLIST_ID_IDENTIFIER object. The property is a string that is the prefix for the ID.
const RANDOM_PLAYLIST_HEADER = "RDAM";

const PLAYLIST_ID_IDENTIFIER = {
	playlist: "PL",
	song: "VL",
	video: "VM",
};

// Create a funciton that will intake an ID as well as a type and return the ID with the correct prefix
export const createRandomMixId = (
	id: string,
	type: keyof typeof PLAYLIST_ID_IDENTIFIER,
) => {
	return PLAYLIST_ID_IDENTIFIER[type] + id;
};

export const isRandomMix = (id: string) => {
	return id.startsWith(RANDOM_PLAYLIST_HEADER);
};
