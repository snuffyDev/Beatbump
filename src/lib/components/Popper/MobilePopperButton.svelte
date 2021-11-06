<script lang="ts">
	import { browser } from '$app/env'

	import drag from '$lib/actions/drag'
	import list from '$lib/stores/list'
	import { key } from '$lib/stores/stores'

	import { createEventDispatcher, onMount } from 'svelte'
	import { fade, fly } from 'svelte/transition'
	import Icon from '../Icon/Icon.svelte'
	import { PopperStore } from './popperStore'

	export let isHidden = false
	export let items = []
	export let type = ''
	const hideEvent = () => dispatch('close')
	const openEvent = () => dispatch('open')

	const dispatch = createEventDispatcher()
</script>

<div
	class="dd-button"
	on:click|stopPropagation={() => {
		PopperStore.set({ items, type })
		// console.log(isHidden)
	}}
>
	<svelte:component this={Icon} color="#f2f2f2" size="1.5rem" name="dots" />
</div>

<style src="./index.scss" lang="scss">
</style>
