<script lang="ts">
	import type { TabItem } from ".";
	import Tab from "../Tab/Tab.svelte";
	export let tabs: TabItem[] = [
		{
			id: "UpNext",
			text: "Up Next",
			action: () => {
				active = tabs[0].id;
			},
		},
		{
			id: "Related",
			text: "Related",
			action: () => {
				active = tabs[1].id;
			},
		},
	];

	export let active = "";

	interface $$Slots {
		default: never;
		tab: { tab: TabItem; isActive: boolean };
	}
</script>

<div class="tab-bar">
	{#each tabs as tab}
		<Tab
			active={active === tab.id}
			on:click={tab.action}>{tab.text}</Tab
		>
	{/each}
</div>
{#each tabs as tab}
	<slot
		{tab}
		isActive={active === tab.id}
		name="tab"
	/>
{/each}

<style
	src="./index.scss"
	lang="scss"
>
</style>
