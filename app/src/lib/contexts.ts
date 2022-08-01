import { makeContext } from "./utils/getContext";
import type { ListItemCtx } from "./types/allContexts";

export const listItemCtxKey = {};
export const CTX_ListItem = makeContext<ListItemCtx>(listItemCtxKey);
