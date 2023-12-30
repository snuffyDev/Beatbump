<script
	context="module"
	lang="ts"
>
	// eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
	type AltSubtitle = {
		tracks: number;
		type: "playlist" | "single" | "album";
		year: number;
	};
</script>

<script
	lang="ts"
	generics="T extends (Subtitle | AltSubtitle)[]"
>
	import Icon from "$components/Icon/Icon.svelte";
	import type { Dropdown, Icons } from "$lib/configs/dropdowns.config";
	import { releasePageContext } from "$lib/contexts";
	import type { Subtitle } from "$lib/types";
	import { windowWidth } from "$stores/window";
	import { createEventDispatcher } from "svelte";
	import Button from "../Button";
	import PopperButton from "../Popper/PopperButton.svelte";

	type Button<
		Type extends string = string,
		T = Type extends "icon" | "outlined" | (undefined & infer T) ? T : unknown,
	> = {
		text?: string;
		type?: T;
		action?: () => void;
		style?: "normal" | "squared";
		icon?: Icons | { name: Icons; size?: string };
	};

	/** Thumbnail to display*/
	export let thumbnail: string | undefined = undefined;
	/** Title of the playlist/album */
	export let title = "";
	/** Description for the playlist/album */
	export let description: string | undefined = undefined;
	/** Subtitles (year/track count/etc.) */
	// eslint-disable-next-line no-undef
	export let subtitles: T[] = [];
	/** Subtitles (year/track count/etc.) */
	export let secondSubtitle:
		| Subtitle[]
		| {
				tracks: number;
				type: "playlist" | "single" | "album";
				year: number;
		  }[] = [];
	/** Buttons (play album/shuffle/etc.)*/
	export let buttons: Button[] = [];
	/** An array of artist or channel objects */
	export let artist: {
		name: string;
		channelId: string;
	}[] = [];
	/** Allows user to change the metadata (local playlists only)*/
	export let editable = false;
	/** Type of metadata (Album / Playlist) */
	export let type = "playlist";

	let DropdownItems: Dropdown = [
		{
			text: "Add to Queue",
			icon: "queue",
			action: () => {
				dispatch("addqueue");
			},
		},
		{
			text: "Add to Playlist",
			icon: "list-plus",
			action: () => {
				dispatch("playlistAdd");
			},
		},
		// @ts-expect-error it's fine
		releasePageContext.has("release")
			? {
					text: "Shuffle",
					action: () => {
						dispatch("shuffle");
					},
					icon: "shuffle",
			  }
			: undefined,
	];

	const dispatch = createEventDispatcher<{
		shuffle: void;
		playlistAdd: void;
		addqueue: void;
	}>();
</script>

<div class="box resp-content-width">
	<div class="img">
		<img
			src={thumbnail}
			loading="lazy"
			width="512"
			height="512"
			style="

--img-height: 512;"
			alt="album"
		/>
	</div>
	<div class="metadata">
		<div class="info-title">
			<span class="box-title"
				>{title}
				{#if Array.isArray(subtitles) && typeof subtitles[0] === "object" && "contentRating" in subtitles[0] && subtitles[0]?.contentRating}
					<span class="explicit" />
				{/if}</span
			>
		</div>
		{#if description && type === "playlist"}
			{#key description}
				<p
					class="secondary subtitle description"
					class:hidden={$windowWidth < 640 ? true : false}
				>
					{description}
				</p>
				<span class="secondary subtitle-group">
					<p class="secondary subtitle">
						{Array.isArray(subtitles) && subtitles.length !== 0
							? subtitles.join(" ")
							: ""}
					</p>
					<em
						><small class="subtitle">
							{Array.isArray(secondSubtitle) && secondSubtitle.join(" ")}
						</small>
					</em>
				</span>
			{/key}
		{:else if type === "release"}
			<p class="secondary">
				{#each artist.slice(1, -2) as subtitle, index}
					{#if subtitle.channelId}
						<a
							class="secondary"
							href={`/artist/${subtitle.channelId}`}>{subtitle.name}</a
						>
					{:else if index !== 0}
						<span>{subtitle.name}</span>
						{#if index === 0}
							<br />
						{/if}
					{/if}
				{/each}
				<br />
				<small>
					<Icon
						name="explicit"
						fill="hsla(0, 0%, 95%, 0.7)"
						color="transparent"
						--stroke="transparent"
						style="margin-right: 0.1em; stroke-width: 4;font-weight: 800;"
						size="1em"
					>
						<span class="sr-only">Explicit</span>
					</Icon>
					{#if "type" in subtitles[0] && "tracks" in subtitles[0] && "year" in subtitles[0]}
						{subtitles[0].type} • {subtitles[0].tracks} • {subtitles[0].year}
					{/if}
				</small>
			</p>
		{/if}
	</div>
	<div class="button-group">
		{#each buttons as { style, type, icon, text, action }, i}
			{#if type === "icon"}
				<PopperButton items={DropdownItems} />
			{:else}
				<Button
					on:click={action}
					class={style ?? ""}
					outlined={i === buttons.length - 1 || type === "outlined"}
					icon={typeof icon === "string"
						? { name: icon }
						: { name: icon?.name, size: icon?.size }}>{text}</Button
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
	p.secondary {
		letter-spacing: -0.01em;
		max-width: 40ch;
	}
</style>
