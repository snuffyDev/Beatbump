export { default } from "./Tabs.svelte";

export type TabItem = {
	id: string;
	text: string;
	action: () => void;
};
