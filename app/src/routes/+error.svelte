<script>
	import { dev } from "$app/environment";

	import { goto } from "$app/navigation";
	import { navigating } from "$app/stores";
	import { onMount } from "svelte";
	let redir = 6;
	let timeout;
	onMount(() => {
		const redirect = () => {
			if (!$navigating) {
				redir--;
				if (redir <= 0) {
					goto("/");
				} else {
					timeout = setTimeout(redirect, 1000);
				}
			} else {
				clearTimeout(timeout);
			}
		};
		if (!dev) redirect();
	});
	$: $navigating && timeout && clearTimeout(timeout);
</script>

<main>
	<a href="/" class="logolink">
		<div class="logo">
			<img src="/logo.svg" width="128" height="128" alt="logo" />
		</div>
	</a>
	<h1>Uh-Oh!</h1>
	<h5>Looks like you hit a dead end!</h5>

	<p>Don't worry though, we got you covered.</p>
	<em>Redirecting in {redir}</em>
</main>

<style lang="scss">
	.logolink {
	}
	main {
		text-align: center;

		align-items: center;
	}
	p {
		font-size: 1.125rem;
	}
	.logo {
		display: flex;
		place-content: center;
	}
</style>
