<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import Button from "../Button";
	import PopperButton from "../Popper/PopperButton.svelte";
	export let thumbnail: string;
	export let title: string = "";
	export let description = undefined;
	export let subtitles = [];
	export let secondSubtitle = [];
	export let buttons = [];
	export let artist = undefined;
	export let editable = false;
	export let type = "playlist";
	let DropdownItems = [
		{
			text: "Add to Queue",
			icon: "queue",
			action: () => {
				dispatch("addqueue");
			},
		},
		{
			text: "Add to Playlist",
			icon: "playlist-add",
			action: () => dispatch("playlistAdd"),
		},
	];

	let width;
	const dispatch = createEventDispatcher();
</script>

<svelte:window bind:innerWidth={width} />

<div class="box resp-content-width">
	<div class="img">
		<img src={thumbnail} loading="lazy" width="512" height="512" style="--img-height: 512;" alt="album" />
	</div>
	<div class="metadata">
		<div class="info-title">
			<span class="box-title"
				>{title}
				{#if Array.isArray(subtitles) && subtitles[0]?.contentRating}
					<span class="explicit"> E </span>
				{/if}</span
			>
		</div>
		{#if description && type == "playlist"}
			{#key description}
				<p class="secondary subtitle description" class:hidden={width < 640 ? true : false}>
					{description}
				</p>
				<span class="secondary subtitle-group">
					<p class="secondary subtitle">
						{Array.isArray(subtitles) && subtitles.length !== 0 ? subtitles.join(" ") : ""}
					</p>
					<em
						><small class="subtitle">
							{Array.isArray(secondSubtitle) && secondSubtitle.join(" ")}
						</small>
					</em>
				</span>
			{/key}
		{:else if type == "release"}
			<p class="secondary">
				{#each artist as artist, i}
					{#if artist.channelId}
						<a href={`/artist/${artist.channelId}`}>{artist.name}</a>
					{:else}
						<span>{artist.name}</span>
						<!-- {#if i !== artist.length - 1}
					-->{/if}
				{/each}
				<small>
					• {subtitles[0].year} • {subtitles[0].tracks}
				</small>
			</p>
		{/if}
	</div>
	<div class="button-group">
		{#each buttons as { type, icon, text, action }, i}
			{#if type == "icon"}
				<PopperButton items={DropdownItems} />
			{:else}
				<Button
					on:click={action}
					outlined={i == buttons.length - 1 || type == "outlined"}
					icon={typeof icon == "string" ? { name: icon } : { name: icon?.name, size: icon?.size }}>{text}</Button
				>
			{/if}
		{/each}
	</div>
</div>

<style lang="scss">
	@import "../../shared/listPages.scss";

	p {
		margin-top: 0;
		margin-bottom: 0.3rem;
	}
</style>
