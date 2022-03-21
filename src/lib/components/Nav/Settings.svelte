<script>
	import { fade } from 'svelte/transition';
	import { circIn } from 'svelte/easing';
	import { filterAutoPlay, theme } from '$stores/stores';
	import { settings } from '$lib/stores/settings';
	import { queryParams } from '$lib/utils';
	import { session } from '$app/stores';

	export let isSettingsOpen;
	let themes = [
		{ name: 'dark' },
		{ name: 'dim' },
		{ name: 'midnight' },
		{ name: 'ytm' }
	];
</script>

{#if isSettingsOpen}
	<div
		class="nav-settings"
		role="settings"
		transition:fade={{ duration: 120, easing: circIn }}
	>
		<!-- <label for="search"><em>search</em></label> -->

		<div class="setting">
			<label for="select" class="s-text">Theme:</label>
			<div class="select">
				<!-- svelte-ignore a11y-no-onchange -->
				<select
					id="select"
					bind:value={$settings.theme}
					on:change={() => {
						localStorage.setItem('theme', $settings.theme);
					}}
				>
					{#each themes as theme}
						<option value={theme.name} selected={$settings.theme}
							>{theme.name}</option
						>
					{/each}
				</select>
			</div>
		</div>
		<div class="setting">
			<label for="checkbox" class="s-text">Dedupe Automix: </label>
			<input
				type="checkbox"
				bind:checked={$settings.dedupe}
				on:change={() => {
					// settings.setDedupe(!filter)
					localStorage.setItem(
						'filterAutoPlay',
						JSON.stringify($settings.dedupe)
					);
				}}
			/>
		</div>
		{#if !$session.iOS}
			<div class="setting">
				<label for="checkbox" class="s-text">Prefer WEBM Audio: </label>
				<input
					type="checkbox"
					bind:checked={$settings.preferWebM}
					on:change={async () => {
						// settings.setPreferWebM(!preferWebM)
						localStorage.setItem(
							'preferWebM',
							JSON.stringify($settings.preferWebM)
						);
					}}
				/>
			</div>
		{/if}
	</div>
{/if}

<style lang="scss">
	.s-text {
		padding: 0 0.8rem 0.2rem 0.8rem;
		font-size: 1.1rem;
	}

	.nav-settings {
		right: 0;
		top: 4rem;
		display: flex;
		background-color: inherit;
		position: fixed;
		padding: 0.5em 0;
		z-index: 10;
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
		justify-content: space-evenly;
		align-items: flex-start;
		@media screen and (max-width: 640px) {
			max-width: 100%;
			// align-items: center;
			// flex-direction: row;
		}
		border: 0.125px solid #aaaaaa45;
		border-top: 0;

		.setting {
			display: inline-flex;
			padding: 0.2rem 0.4rem;
			margin-bottom: 0.5rem;
			color: inherit;
			flex-direction: row;
			vertical-align: top;
			align-items: center;
		}
	}

	/* your styles go here */
</style>
