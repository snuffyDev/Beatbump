import { page } from "$app/stores";
import { derived, readable } from "svelte/store";

export const SITE_ORIGIN_URL = derived(page, ($page) => $page.url.origin);
