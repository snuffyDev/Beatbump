import { DROPDOWN_ITEMS, type Label, type TypedDropdownItem } from "./dropdowns.config";

type Schema = {
	readonly [PropertyKey in keyof typeof DROPDOWN_ITEMS]: Partial<
		TypedDropdownItem<typeof DROPDOWN_ITEMS[PropertyKey]["text"], typeof DROPDOWN_ITEMS[PropertyKey]["icon"]>
	>;
};

export const ListItemMenuSchema: Pick<
	Schema,
	"View Artist" | "Play Song Radio" | "Add to Playlist" | "Favorite" | "Share"
> = {
	"Add to Playlist": DROPDOWN_ITEMS["Add to Playlist"],
	"Play Song Radio": DROPDOWN_ITEMS["Play Song Radio"],
	"View Artist": DROPDOWN_ITEMS["View Artist"],
	Favorite: DROPDOWN_ITEMS["Favorite"],
	Share: DROPDOWN_ITEMS["Share"],
};
