<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	export const load: Load = async ({ params, fetch, url }) => {
		const { slug } = params;
		const response = await fetch(`/api/playlist.json?list=${params.slug}`);
		const data = await response.json();
		// console.log(data);
		const {
			tracks = [],
			header = {},
			continuations = {},
			carouselContinuations
		} = await data;
		if (!response.ok) {
			return {
				error: Error(response.statusText),
				status: response.status
			};
		}
		return {
			props: {
				tracks: tracks,

				continuations: continuations,
				carouselContinuations,
				header: header,
				id: slug,
				key: url.pathname
			},
			stuff: {
				path: url.pathname
			},
			maxage: 3600,
			status: 200
		};
	};
</script>

<script lang="ts">
	import ListItem from '$components/ListItem/ListItem.svelte';
	import List from './_List.svelte';
	import list from '$lib/stores/list';
	import { isPagePlaying, showAddToPlaylistPopper } from '$lib/stores/stores';
	import { setContext } from 'svelte';

	import InfoBox from '$lib/components/Layouts/InfoBox.svelte';
	import { writable } from 'svelte/store';
	import Header from '$lib/components/Layouts/Header.svelte';
	import type { Header as HeaderType } from '$lib/types/playlist';
	import type { IListItemRenderer } from '$lib/types/musicListItemRenderer';
	import Carousel from '$lib/components/Carousel/Carousel.svelte';
	import ListInfoBar from '$lib/components/ListInfoBar';
	import { notify } from '$lib/utils';

	export let tracks: IListItemRenderer[];
	export let header: HeaderType = {
		thumbnails: [],
		description: '',
		playlistId: '',
		secondSubtitle: [],
		subtitles: [],
		title: ''
	};
	// export let data
	export let id: string;
	export let continuations;
	export let carouselContinuations;
	export let key;
	let ctoken = continuations?.continuation || '';
	let itct = continuations?.clickTrackingParams || '';
	let width;
	let pageTitle = header?.title;
	let description;
	$: id = id;
	let isLoading = false;
	let hasData = false;
	let carousel;
	// initialize playlist page
	const ctx = {};
	const trackStore = writable<IListItemRenderer[]>([]);
	trackStore.set(tracks);

	setContext(ctx, { pageId: id });
	// $: browser &&
	// 	console.log(data, carouselContinuations, tracks, continuations, id)

	pageTitle =
		pageTitle.length > 64 ? pageTitle.substring(0, 64) + '...' : header.title;
	description =
		header.description.length > 240
			? header.description.substring(0, 240) + '...'
			: header.description;
	const getCarousel = async () => {
		if (!carouselContinuations) return;
		const response = await fetch(
			'/api/playlist.json' +
				'?ref=' +
				id +
				`${
					carouselContinuations
						? `&ctoken=${encodeURIComponent(
								carouselContinuations?.continuation
						  )}`
						: ''
				}` +
				'&itct=' +
				carouselContinuations?.clickTrackingParams
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
				'/api/playlist.json' +
					'?ref=' +
					id +
					`${ctoken ? `&ctoken=${encodeURIComponent(ctoken)}` : ''}` +
					'&itct=' +
					itct
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
					})
				);
			}
			return !isLoading;
		} catch (error) {
			hasData = null;
			isLoading = false;
		}
	};
	const setId = () => isPagePlaying.set(id);
	let value;
	let options = [
		{
			label: 'Unsorted',
			params: 'nosort',
			action: () => {
				console.log('nosort');
			}
		},
		{
			label: 'Artist (A-Z)',
			params: 'a-az',
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
					})
				];
			}
		},
		{
			label: 'Artist (Z-A)',
			params: 'a-za',
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
					})
				];
			}
		},
		{
			label: 'Title (A-Z)',
			params: 't-az',
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
					})
				];
			}
		},
		{
			label: 'Title (Z-A)',
			params: 't-za',
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
					})
				];
			}
		}
	];
	let filter = value ? value : options[0].params;
</script>

<svelte:window bind:innerWidth={width} />
<Header
	title={header?.title}
	url={`${key}/${id}`}
	desc={description}
	image={header?.thumbnails[header.thumbnails?.length - 1]?.url}
/>
<main>
	<InfoBox
		subtitles={header.subtitles}
		secondSubtitle={header.secondSubtitle}
		thumbnail={header.thumbnails[header.thumbnails?.length - 1].url.replace(
			/=(w(\d+))-(h(\d+))/g,
			'=w512-h512'
		)}
		title={pageTitle}
		{description}
		buttons={[
			{
				action: () => {
					setId();
					// list.startPlaylist(header.playlistId)
					list.initList({
						playlistId: header.playlistId,
						config: { playerParams: 'wAEB' }
					});
				},
				icon: 'shuffle',
				text: 'Shuffle'
			},
			{
				action: () => {
					setId();
					list.initList({
						playlistId: header.playlistId,
						config: { playerParams: 'wAEB8gECGAE%3D' }
					});
				},
				icon: 'play',
				type: 'outlined',
				text: 'Start Radio'
			},
			{
				action: () => {},
				icon: { name: 'dots', size: '1.25rem' },
				text: '',
				type: 'icon'
			}
		]}
		on:addqueue={() => {
			setId();
			list.startPlaylist(header.playlistId);

			notify(`${pageTitle} added to queue!`, 'success');
		}}
		on:playlistAdd={async () => {
			const response = await fetch(
				'/api/getQueue.json?playlistId=' + header?.playlistId
			);
			const data = await response.json();
			const items = data;
			showAddToPlaylistPopper.set({ state: true, item: [...items] });
		}}
	/>
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
			{ctx}
			parentPlaylistId={id.slice(2)}
			page="playlist"
			on:pagePlaying={() => {
				setId();
			}}
			{item}
			{index}
		/>
	</List>
	<footer>
		{#if carousel}
			<Carousel
				header={carousel?.header}
				items={carousel?.results}
				type="home"
				isBrowseEndpoint={false}
			/>
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
