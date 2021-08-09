<script>
	import { fade, slide, fly } from 'svelte/transition'
	import Icon from '$components/Icon/Icon.svelte'
	import Search from '$components/Search/Search.svelte'
	import { theme } from '$lib/stores/stores'
</script>

<div class="sidebar" transition:fly>
	<section class="head">
		<slot name="head">
			<Search type="block" /></slot>
		<br />
	</section>
	<section class="mid">
		<slot name="middle"><hr /></slot>
	</section>
	<section class="bottom">
		<slot name="bottom"
			><em>Get the code on Github</em>

			<section class="flex">
				<a href="https://github.com/snuffyDev/Beatbump" rel="external"
					><Icon name="github" size="1.5rem" /></a>
			</section>
		</slot>
	</section>
</div>

<style lang="scss">
	hr {
		border: none;
		color: none;
		background: none;
	}
	.flex {
		display: flex;
		flex-direction: column;
		align-items: center;
		a {
			width: 1.5em;
		}
	}
	.sidebar {
		overflow-x: hidden;
		overflow-y: hidden;
		top: 0;

		padding: 0 0.3125rem 6rem;
		width: 16rem;
		max-width: 16rem;
		height: 100%;
		min-height: 100%;
		border-right: 0.0625rem outset hsla(0, 0%, 66.7%, 0.123);
		box-sizing: border-box;
		display: none;
		visibility: hidden;
		contain: layout;
		grid-area: s;
		grid-template-rows: 1fr 1fr 1fr;
		grid-gap: 1rem;
		padding-inline: auto;
		box-shadow: -0.2rem 0.1rem 1rem 0.1rem rgb(0 0 0 / 49%);
		justify-items: center;
	}

	.head {
		width: 100%;
		padding-top: 0.8em;
	}
	.bottom {
		position: absolute;
		bottom: 1rem;

		flex-direction: column;

		line-height: 2;
		text-align: center;
		flex-wrap: nowrap;
		left: 0;
		right: 0;

	}
	@media (min-width: 640px) {
		.sidebar {
			display: grid;

			visibility: visible;
		}
	}
</style>
