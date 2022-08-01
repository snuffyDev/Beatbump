<script context="module" lang="ts">
	export const prerender = false;
</script>

<script lang="ts">
	import { browser } from "$app/env";
	import { session } from "$app/stores";
	import Header from "$components/Layouts/Header.svelte";
	import type { TabItem } from "$lib/components/Tabs";
	import Tabs from "$lib/components/Tabs";
	import { settings, SettingsSchema } from "$stores/settings";

	// const tabs:TabItem[] = [{id:""}]
</script>

<Header title="Settings" url="/settings" desc="Configure your app settings" />
<main>
	{#if browser}
		{#each Object.entries(SettingsSchema) as [sectionKey, section]}
			{@const category = sectionKey[0].toUpperCase() + sectionKey.slice(1)}
			<section>
				<span class="h5">{category}</span>
				{#each Object.entries(section).filter( ([key, _]) => (!$session.iOS ? key === key : key !== "Prefer WebM Audio"), ) as [key, value]}
					{@const id = key.replace(" ", "")}
					<div class="setting">
						<label for={id} class="s-text">{key}: </label>
						{#if value[1] === null}
							<input type="checkbox" bind:checked={$settings[sectionKey][key]} {id} />
						{:else if value[0] === 3}
							<a href={value[1]}>{value[1]}</a>
						{:else if Array.isArray(value[1])}
							<div class="select">
								<select disabled={key === "Quality"} bind:value={$settings[sectionKey][key]} {id}>
									{#each value[1] as entry}
										<option value={entry} selected={$settings[sectionKey][key] === entry}>{entry}</option>
									{/each}
								</select>
							</div>
						{/if}
					</div>
				{/each}
			</section>
		{/each}
	{/if}
</main>

<style lang="scss">
	label {
		display: inline-block;
		margin-right: auto;
		font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell,
			"Open Sans", "Helvetica Neue", sans-serif;
		font-size: 1em;
		text-transform: none !important;
		font-variant: unset;
	}
	section {
		display: flex;
		flex-direction: column;
		margin-block-end: 1em;

		&:not(:last-child) {
			border-bottom: 0.01em solid rgba(218, 218, 218, 0.082);
		}
	}

	.setting {
		display: inline-flex;
		margin-top: 1em;
		color: inherit;
		flex-direction: row;
		vertical-align: top;
		align-items: center;
		margin-bottom: 1em;
	}
</style>
