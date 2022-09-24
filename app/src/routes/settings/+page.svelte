<script lang="ts">
	import Header from "$components/Layouts/Header.svelte";
	import { AudioPlayer } from "$lib/player";
	import { settings, SettingsSchema, type Theme } from "$stores/settings";
	const themes: Theme[] = ["Dark", "Dim", "Midnight", "YTM"];

	function handleStreamSelect() {
		console.log("settings");
		AudioPlayer.dispatch("update:stream_type", { type: $settings.playback.Stream });
	}
</script>

<Header title="Settings" url="/settings" desc="Configure your app settings" />
<main class="resp-content-width">
	<section>
		<span class="h5">Appearance</span>
		<div class="setting">
			<label for="theme">Theme </label>
			<div class="select">
				<select name="theme" id="theme" bind:value={$settings["appearance"]["Theme"]}>
					{#each themes as theme}
						<option value={theme} selected={$settings["appearance"]["Theme"] === theme}>{theme}</option>
					{/each}
				</select>
			</div>
		</div>
		<div class="setting">
			<label>Immersive Queue</label>
			<input
				type="checkbox"
				name="immersive-queue"
				id="immersive-queue"
				bind:checked={$settings["appearance"]["Immersive Queue"]}
			/>
			<label for="immersive-queue" class="switch" />
		</div>
	</section>
	<section>
		<span class="h5">Playback</span>
		<div class="setting">
			<label>Dedupe Automix</label>

			<input name="dedupe" id="dedupe" type="checkbox" bind:value={$settings["playback"]["Dedupe Automix"]} />
			<label for="dedupe" class="switch" />
		</div>
		<div class="setting">
			<label for="quality">Quality</label>
			<div class="select">
				<select name="quality" disabled id="quality" bind:value={$settings["playback"]["Quality"]}>
					{#each ["Normal", "High"] as option}
						<option value={option} selected={$settings["playback"]["Quality"] === option}>{option}</option>
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
				<select name="stream" id="stream" bind:value={$settings["playback"]["Stream"]} on:change={handleStreamSelect}>
					{#each ["HTTP", "HLS"] as option}
						<option value={option} selected={$settings["playback"]["Stream"] === option}>{option}</option>
					{/each}
				</select>
			</div>
		</div>
	</section>
	<section>
		<span class="h5">Network</span>
		<div class="setting">
			<label for="proxy">Audio Proxy Server </label>
			<div class="input-container">
				<div class="input no-btn mb-1">
					<input
						type="text"
						on:input={(e) => {
							let value = e.currentTarget.value;
							if (!value.match(/^https?:\/\//gm)) value = "https://" + value;
							if (!value.endsWith("/")) value = value + "/";

							$settings["network"]["HLS Stream Proxy"] = value;
						}}
						placeholder="https://yt-hls-rewriter.onrender.com/"
						value={$settings["network"]["HLS Stream Proxy"]}
					/>
				</div>
				<span
					class="link"
					on:click={() => {
						$settings["network"]["HLS Stream Proxy"] = "https://yt-hls-rewriter.onrender.com/";
					}}>Reset to default</span
				>
			</div>
		</div>
	</section>
	<section>
		<span class="h5">Search</span>
		<div class="setting">
			<label for="preserve">Preserve </label>
			<div class="select">
				<select name="preserve" id="preserve" bind:value={$settings["search"]["Preserve"]}>
					{#each ["Category", "Query", "Category + Query", "None"] as option}
						<option value={option} selected={$settings["playback"]["Stream"] === option}>{option}</option>
					{/each}
				</select>
			</div>
		</div>
	</section>
</main>

<style lang="scss">
	.input-container {
		min-width: 15ch !important;
		max-width: 32ch !important;
		width: 100%;
	}

	label {
		display: inline-block;

		font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell,
			"Open Sans", "Helvetica Neue", sans-serif;
		font-size: 1em;
		text-transform: none !important;
		font-variant: unset;
		@media screen and (min-width: 40em) {
			~ :last-child {
				margin-left: auto;
			}
		}
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
		color: inherit;
		vertical-align: top;

		gap: 1em;
		flex-direction: column;
		margin-block: 1em;
		&:first-of-type {
			margin-block-start: 0em;
		}
		&:last-of-type {
			margin-block-end: 2em;
		}
		@media screen and (min-width: 40em) {
			align-items: center;
			flex-direction: row;
		}
	}
	.switch {
		position: relative;
		display: inline-flex;
		align-items: center;
		width: 3.8125em;
		height: 2em;
		cursor: pointer;
		overflow: hidden;
		background-color: rgba(109, 109, 109, 0.35);
		border-radius: 1.25rem;
		transition: background-color 0.3s;
	}
	.switch::after {
		--size: calc(2em - (2px * 2));
		content: "";
		position: absolute;
		width: var(--size);
		height: var(--size);
		border-radius: 9999em;
		background-color: white;
		// top: 0.06125em;
		left: 0.125em;
		transition: left 0.3s;
		box-shadow: 0 0 5px 0.5px rgba(0, 0, 0, 0.384);
	}

	[type="checkbox"]:checked + .switch::after {
		left: 2em;
	}
	[type="checkbox"]:checked + .switch {
		background-color: #00cd6a;
	}
	[type="checkbox"] {
		display: none;
	}
</style>
