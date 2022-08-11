<script context="module" lang="ts">
	export const prerender = false;
</script>

<script lang="ts">
	import Header from "$components/Layouts/Header.svelte";
	import { settings, SettingsSchema, type Theme } from "$stores/settings";
	const themes: Theme[] = ["Dark", "Dim", "Midnight", "YTM"];

	// const tabs:TabItem[] = [{id:""}]
</script>

<Header title="Settings" url="/settings" desc="Configure your app settings" />
<main>
	<section>
		<span class="h5">Appearance</span>
		<div class="setting">
			<label for="theme">
				Theme
			</label>
			<div class="select">

				<select name="theme" id="theme" bind:value={$settings['appearance']['Theme']}>
					{#each themes as theme}
						<option value="{theme}" selected={$settings['appearance']['Theme'] === theme}>{theme}</option>
					{/each}
				</select>
			</div>
		</div>
		<div class="setting">
			<label for="immersive-queue">
				Immersive Queue
			</label>
			<input type="checkbox" name="immersive-queue" id="immersive-queue" bind:checked={$settings['appearance']['Immersive Queue']}/>
		</div>

	</section>
	<section>
		<span class="h5">Playback</span>
		<div class="setting">
			<label for="dedupe">
				Dedupe Automix
			</label>
			<input name="dedupe" id="dedupe" type="checkbox" bind:value={$settings['playback']['Dedupe Automix']}/>

		</div>
		<div class="setting">
			<label for="quality">
				Quality
			</label>
			<div class="select">
				<select name="quality" disabled id="quality" bind:value={$settings['playback']['Quality']}>
					{#each ["Normal", "High"] as option}
						<option value="{option}" selected={$settings['playback']['Quality'] === option}>{option}</option>
					{/each}
				</select>
			</div>
		</div>
		<div class="setting">
			<label for="stream">
				Stream
				<i> (reload Beatbump after setting)</i>

			</label>
			<div class="select">
				<select name="stream" id="stream" bind:value={$settings['playback']['Stream']}>
					{#each ["HTTP", "HLS"] as option}
						<option value="{option}" selected={$settings['playback']['Stream'] === option}>{option}</option>
					{/each}
				</select>
			</div>
		</div>

	</section>
	<!-- <section>
		<span class="h5">Network</span>
		<div class="setting">
			<label for="proxy">
				Stream Proxy Server
			</label>
			<select name="proxy" id="proxy" bind:value={$settings['network']['Proxy']}>
				{#each ["HTTP", "HLS"] as option}
					<option value="{option}" selected={$settings['playback']['Stream'] === option}>{option}</option>
				{/each}
			</select>
		</div>
	</section> -->
	<section>
		<span class="h5">Search</span>
		<div class="setting">
			<label for="preserve">
				Preserve
			</label>
			<div class="select">
				<select name="preserve" disabled id="preserve" bind:value={$settings['search']['Preserve']}>
					{#each ["Category", "Query", "Category + Query", "None"] as option}
						<option value="{option}" selected={$settings['playback']['Stream'] === option}>{option}</option>
					{/each}
				</select>
			</div>
		</div>

	</section>

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
