<script lang="ts">
	import { getContext } from 'svelte'

	import Icon from '../Icon/Icon.svelte'

	export let text = ''
	export let icon = ''

	getContext('menu')
</script>

<div class="popout-item" on:click>
	<Icon name={icon} color="white" size="1.25em" />
	<div class="po-text">{text}</div>
</div>

<style lang="scss">
	.po-text {
		display: inline-block;
		margin-left: 0.5em;
		font-size: 1em;
		white-space: nowrap;
	}
	.popout-item {
		z-index: 5;
		display: flex;
		flex-direction: row;
		/* backdrop-filter: opacity(0); */
		padding: 0.8rem;
		align-items: center;
		cursor: pointer;
		margin: 0;
		border-bottom: 0.0714rem solid #313338;
		color: #fff9f9;
		background-color: #1a1a20;
		position: relative;
		border-radius: 0.4rem;
		filter: drop-shadow(0rem 0.25rem 0.2rem rgba(0, 0, 0, 0.342));
		// box-shadow: 0em 0.5em 0.5em 0em #1f1f1f40;
		&:hover {
			color: #fcf6f6;
			background-color: #6f6f85;
			transition: cubic-bezier(0.25, 0.46, 0.45, 0.94) all 0.1s;
		}
	}

	:root .light * {
		color: white;
	}
</style>
