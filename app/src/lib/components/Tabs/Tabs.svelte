<script lang="ts">
	import { notify } from "$lib/utils";
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
</script>

<div class="tab-bar">
	{#each tabs as tab}
		<Tab active={active === tab.id} on:click={tab.action}>{tab.text}</Tab>
	{/each}
</div>

<style src="./index.scss" lang="scss">
</style>
