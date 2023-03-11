import { makeContext } from "./utils/getContext";
import type { ListItemCtx } from "./types/allContexts";

const KEYS = {
	releaseCtxKey: {},
};
export const listItemCtxKey = {};
export const CTX_ListItem = makeContext<ListItemCtx>(listItemCtxKey);
export const releasePageContext = makeContext<{ page: "release" }>(KEYS.releaseCtxKey);
