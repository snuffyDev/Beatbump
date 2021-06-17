<script>
	import { fade, slide, fly } from 'svelte/transition'
	import Search from './Search.svelte'
</script>

<div class="sidebar" transition:fly>
	<section class="head">
		<slot name="head">
			<Search /></slot>
		<br />
	</section>
	<!-- <section class="mid">
		<slot name="middle"><hr /></slot>
	</section>
	<section class="bottom">
		<slot name="bottom"><em>Stay tuned for more features!</em></slot>
	</section> -->
</div>

<style lang="scss">
	.sidebar {
		padding: 0 0.3125rem;
		/* position: fixed; */
		overflow-x: hidden;
		top: 0;
		bottom: 6rem;
		padding-bottom: 6rem;
		width: 16rem;
		height: 100%;
		min-height: 100%;
		border-right: 0.0625rem outset hsla(0, 0%, 66.7%, 0.123);
		/* padding-top: 4.3125rem; */
		box-sizing: border-box;
		display: none;
		grid-area: s;
		grid-template-rows: auto 1fr auto;
		grid-gap: 1rem;
		padding-inline: auto;
		box-shadow: -0.2rem 0.1rem 1rem 0.1rem rgba(0, 0, 0, 0.486);
		justify-items: center;
	}
	hr {
		color: white;
		width: 100%;
	}
	.nav-item {
		width: 100%;
		display: flex;
		flex-direction: column;
		margin-bottom: 0.53125rem;
	}
	.header-text {
		text-align: center;
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		font-size: 1.125rem;
	}
	.head {
		width: 100%;
		padding-top: 0.8em;
	}
	@media (min-width: 640px) {
		.sidebar {
			display: grid;
		}
	}
</style>
