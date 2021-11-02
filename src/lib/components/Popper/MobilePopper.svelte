<script lang="ts">
	import drag from '$lib/actions/drag'
	import list from '$lib/stores/list'
	import { key } from '$lib/stores/stores'

	import { createEventDispatcher, onMount } from 'svelte'
	import { fade, fly } from 'svelte/transition'
	import Icon from '../Icon/Icon.svelte'

	export let isHidden = false
	export let items = []
	export let type = ''
	const hideEvent = () => dispatch('close')
	const openEvent = () => dispatch('open')
	let listHeight
	let sliding
	let posY = 0
	let showing
	function startHandler() {
		sliding = true
	}

	function release() {
		if (sliding) {
			if (posY < listHeight / 1.5) {
				open()
			} else {
				close()
			}
		}
		sliding = false
	}
	function trackMovement({ y, dy }) {
		// console.log(y, y + dy)
		if (y <= listHeight && y >= 0) {
			posY = y + dy
		} else if (y > listHeight) {
			trackOpen()
		} else {
			close()
		}
		// console.log(y, 'dy: ' + dy)
	}
	function trackOpen() {
		posY = posY
	}
	function open() {
		posY = 0
	}
	function close() {
		posY = 100
		isHidden = false
		sliding = false
	}
	// $: console.log($list.mix[$key])
	// onMount(() => {
	// 	document.querySelector('#wrapper').classList.add('no-scroll')
	// 	return () =>
	// 		document.querySelector('#wrapper').classList.remove('no-scroll')
	// })
	const dispatch = createEventDispatcher()
</script>

<svelte:window bind:innerHeight={listHeight} />
{#if items.length !== 0 && isHidden}
	<div
		class="backdrop"
		on:click={() => (isHidden = false)}
		transition:fade={{ duration: 125 }}
	/>
	<div
		in:fly={{ duration: 125, delay: 125, y: 5 }}
		out:fly={{ duration: 250, delay: 125, y: 5 }}
		class="drag"
		style="transform: translateY({posY / 5}px); height:  auto; bottom:0; "
	>
		<div class="popper">
			<div
				class="handle"
				use:drag
				on:startDrag={startHandler}
				on:dragMove={(e) => trackMovement({ y: e.detail.y, dy: e.detail.dy })}
				on:dragEnd={release}
			>
				<Icon name="minus" color="#f2f2f2" width="100%" />
			</div>
			{#if type == 'player'}
				<section class="m-metadata">
					<div class="image">
						<img src={$list.mix[$key].thumbnail} alt="" />
					</div>
					<div class="metatext">
						<span>{$list.mix[$key].title}</span>
						<span class="artist">
							{$list.mix[$key].artist
								? $list.mix[$key].artist
								: $list.mix[$key].artistInfo.artist ||
								  $list.mix[$key].artistInfo.artist[0]}
						</span>
						<span class="length">
							<span class="subheading">Now playing</span>
						</span>
					</div>
				</section>
			{/if}
			<ul>
				{#each items as item}
					<li
						on:click={item.action}
						on:click={() => {
							isHidden = false
						}}
					>
						<Icon name={item.icon} color="#f2f2f2" size="1.5em" />
						<span class="text">{item.text}</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>
{/if}
<div
	class="dd-button"
	on:click|stopPropagation={() => {
		isHidden = !isHidden
		// console.log(isHidden)
	}}
>
	<svelte:component this={Icon} color="#f2f2f2" size="1.5rem" name="dots" />
</div>

<style src="./index.scss" lang="scss">
</style>
