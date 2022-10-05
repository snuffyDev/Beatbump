<script lang="ts">
	import ListItem from "$lib/components/ListItem/ListItem.svelte";
	import List from "../_List.svelte";
	import list from "$lib/stores/list";
	import { ctxKey, isPagePlaying, showAddToPlaylistPopper } from "$lib/stores/stores";

	import InfoBox from "$lib/components/Layouts/InfoBox.svelte";
	import { writable } from "svelte/store";
	import Header from "$lib/components/Layouts/Header.svelte";
	import type { Header as HeaderType } from "$lib/types/playlist";
	import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";
	import Carousel from "$lib/components/Carousel/Carousel.svelte";
	import ListInfoBar from "$lib/components/ListInfoBar";
	import { notify, type Maybe } from "$lib/utils";
	import { browser } from "$app/environment";
	import { CTX_ListItem } from "$lib/contexts";
	import type { NextContinuationData } from "$lib/types";
	import type { PageData } from "./$types";

	export let data: PageData;

	const {
		tracks = [],
		header = {
			thumbnails: [],
			description: "",
			playlistId: "",
			secondSubtitle: [],
			subtitles: [],
			title: "",
		},
		id = "",
		continuations,
		carouselContinuations,
		visitorData,
		key,
	} = data;

	$: ctoken = continuations?.continuation || "";
	$: itct = continuations?.clickTrackingParams || "";
	let width = 640;
	let pageTitle = header?.title;
	let description;
	let isLoading = false;
	let hasData = false;
	let carousel;
	// initialize playlist page
	const ctx = {};
	const trackStore = writable<IListItemRenderer[]>([]);
	trackStore.set(tracks);
	// $: console.log(tracks);
	CTX_ListItem.set({ page: "playlist", innerWidth: width, parentPlaylistId: id });

	pageTitle = pageTitle.length > 64 ? pageTitle.substring(0, 64) + "..." : header?.title || "";
	description =
		header?.description !== undefined
			? header?.description.length > 240
				? header?.description.substring(0, 240) + "..."
				: header?.description
			: "";
	const getCarousel = async () => {
		if (!carouselContinuations) return;
		const response = await fetch(
			"/api/v1/playlist.json" +
				"?ref=" +
				id +
				`${carouselContinuations ? `&ctoken=${encodeURIComponent(carouselContinuations?.continuation)}` : ""}` +
				"&itct=" +
				carouselContinuations?.clickTrackingParams,
		);
		const data = await response.json();

		if (data?.carousel) {
			carousel = { ...data?.carousel };
		}
	};
	const getContinuation = async () => {
		if (isLoading || hasData) return;
		if (!itct || !ctoken) {
			getCarousel();
			hasData = true;
			return;
		}

		try {
			isLoading = true;
			const response = await fetch(
				"/api/v1/playlist.json" +
					"?ref=" +
					id +
					"&visitorData=" +
					visitorData +
					`${ctoken ? `&ctoken=${encodeURIComponent(encodeURIComponent(ctoken))}` : ""}` +
					"&itct=" +
					itct,
			);
			const data = await response.json();
			const continuationItems = data.tracks;
			// Continuations check
			if (data.continuations) {
				/*
					if response has coninuations object, set the new ITCT and Ctoken
					update tracks
				*/
				ctoken = data.continuations.continuation;
				itct = data.continuations.clickTrackingParams;
				trackStore.update((t) => [...t, ...continuationItems]);
				isLoading = false;
				hasData = data.length === 0;
				return hasData;
			} else {
				/*
					if no continuations object is found, set:
					- ctoken to null
					- itct to defined
				*/
				ctoken = null;
				itct = undefined;
				getCarousel();
				hasData = null;
				isLoading = false;
				trackStore.update((t) =>
					[...t, ...continuationItems].filter((item) => {
						if (item !== null || item !== undefined) {
							return item;
						}
					}),
				);
			}
			return !isLoading;
		} catch (error) {
			hasData = null;
			isLoading = false;
		}
	};
	const setId = () => isPagePlaying.add(id);
	let value;
	let options = [
		{
			label: "Unsorted",
			params: "nosort",
			action: () => {
				console.log("nosort");
			},
		},
		{
			label: "Artist (A-Z)",
			params: "a-az",
			action: () => {
				$trackStore = [
					...$trackStore.sort((a, b) => {
						const itemA = a.artistInfo.artist[0].text.toLowerCase();
						const itemB = b.artistInfo.artist[0].text.toLowerCase();
						if (itemA < itemB) {
							return -1;
						}
						if (itemA > itemB) {
							return 1;
						}
					}),
				];
			},
		},
		{
			label: "Artist (Z-A)",
			params: "a-za",
			action: () => {
				$trackStore = [
					...$trackStore.sort((a, b) => {
						const itemA = a.artistInfo.artist[0].text.toLowerCase();
						const itemB = b.artistInfo.artist[0].text.toLowerCase();
						if (itemA < itemB) {
							return 1;
						}
						if (itemA > itemB) {
							return -1;
						}
					}),
				];
			},
		},
		{
			label: "Title (A-Z)",
			params: "t-az",
			action: () => {
				$trackStore = [
					...$trackStore.sort((a, b) => {
						const itemA = a.title.toLowerCase();
						const itemB = b.title.toLowerCase();
						if (itemA < itemB) {
							return -1;
						}
						if (itemA > itemB) {
							return 1;
						}
					}),
				];
			},
		},
		{
			label: "Title (Z-A)",
			params: "t-za",
			action: () => {
				$trackStore = [
					...$trackStore.sort((a, b) => {
						const itemA = a.title.toLowerCase();
						const itemB = b.title.toLowerCase();
						if (itemA < itemB) {
							return 1;
						}
						if (itemA > itemB) {
							return -1;
						}
					}),
				];
			},
		},
	];
	let filter = value ? value : options[0].params;
</script>

<svelte:window bind:innerWidth={width} />
{#if header.title !== "error"}
	<Header
		title={header?.title}
		url={`${key}`}
		desc={description}
		image={header?.thumbnails !== null ? header?.thumbnails[header?.thumbnails?.length - 1]?.url : undefined}
	/>
{/if}
<main>
	{#if header.title !== "error"}
		<InfoBox
			subtitles={header?.subtitles}
			secondSubtitle={header?.secondSubtitle}
			thumbnail={header?.thumbnails !== null
				? header?.thumbnails[header?.thumbnails?.length - 1].url.replace(/=(w(\d+))-(h(\d+))/g, "=w512-h512")
				: undefined}
			title={pageTitle}
			{description}
			buttons={[
				{
					action: () => {
						setId();
						// list.startPlaylist(header.playlistId)
						list.initAutoMixSession({
							playlistId: header.playlistId,
							config: { playerParams: "wAEB" },
						});
					},
					icon: "shuffle",
					text: "Shuffle",
				},
				{
					action: () => {
						setId();
						list.initAutoMixSession({
							playlistId: header.playlistId,
							config: { playerParams: "wAEB8gECGAE%3D" },
						});
					},
					icon: "play",
					type: "outlined",
					text: "Start Radio",
				},
				{
					action: () => {},
					icon: { name: "dots", size: "1.25rem" },
					text: "",
					type: "icon",
				},
			]}
			on:addqueue={() => {
				setId();
				list.initPlaylistSession({ playlistId: header.playlistId });

				notify(`${pageTitle} added to queue!`, "success");
			}}
			on:playlistAdd={async () => {
				const response = await fetch("/api/v1/get_queue.json?playlistId=" + header?.playlistId);
				const data = await response.json();
				const items = data;
				showAddToPlaylistPopper.set({ state: true, item: [...items] });
			}}
		/>
	{/if}
	<ListInfoBar
		bind:value
		on:change={async () => {
			options[value].action();
		}}
		{options}
	/>

	<List
		bind:items={$trackStore}
		bind:isLoading
		on:getMore={async () => await getContinuation()}
		bind:hasData
		let:item
		let:index
	>
		<ListItem
			on:setPageIsPlaying={() => {
				setId();
			}}
			{item}
			idx={index}
		/>
	</List>
	<footer>
		{#if carousel}
			<Carousel header={carousel?.header} items={carousel?.results} type="home" isBrowseEndpoint={false} />
		{/if}
	</footer>
</main>

<style lang="scss">
	footer {
	}

	.list {
		display: block;
		height: 100%;
	}
</style>
