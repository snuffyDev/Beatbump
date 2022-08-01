<script>
	import { fade } from "svelte/transition";
	import { circIn } from "svelte/easing";
	import { settings, SettingsSchema } from "$lib/stores/settings";
	import { session } from "$app/stores";

	export let isSettingsOpen;
</script>

{#if isSettingsOpen}
	<div class="nav-settings" transition:fade={{ duration: 120, easing: circIn }}>
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
	</div>
{/if}

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
	.nav-settings {
		right: 0;
		top: var(--top-bar-height);
		display: flex;
		background: var(--top-bg);
		position: fixed;
		padding: 1em;
		z-index: 100;
		isolation: isolate;
		border-radius: 0 0 0.5rem 0.5rem;
		flex-direction: column;
		width: 100%;
		overflow: hidden;
		max-width: 44ch;
		border: 0.125px solid hsla(0, 0%, 66.7%, 0.27058823529411763);
		border-top: 0;
		white-space: pre-line;
		line-break: normal;
		word-break: normal;
		// box-shadow: 0 0 0.5em 0 #000;
		// justify-content: space-evenly;
		// align-items: flex-start;
		@media screen and (max-width: 640px) {
			max-width: 100%;
			// align-items: center;
			// flex-direction: row;
		}
		border: 0.125px solid #aaaaaa45;
		border-top: 0;
		overflow-y: auto;
		max-height: calc(100% - 9.75rem);
		.setting {
			display: inline-flex;
			margin-top: 1em;
			color: inherit;
			flex-direction: row;
			vertical-align: top;
			align-items: center;
			margin-bottom: 1em;
		}
	}

	/* your styles go here */
</style>
