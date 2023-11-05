import type { ListItemCtx } from "./types/allContexts";
import { makeContext } from "./utils/getContext";

const KEYS = {
	releaseCtxKey: {},
	homeChipCtxKey: {},
};

export const listItemCtxKey = {};
export const CTX_ListItem = makeContext<ListItemCtx>(listItemCtxKey);
export const releasePageContext = makeContext<{ page: "playlist" | "release" }>(
	KEYS.releaseCtxKey,
);
export const homeChipContext = makeContext<{ params: string }>(
	KEYS.homeChipCtxKey,
);
