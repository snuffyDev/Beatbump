<script>
	import { goto } from "$app/navigation";

	$: redir = 10;
	const redirect = () => {
		redir = redir - 1;
		if (redir <= 0) {
			goto("/");
		} else {
			setTimeout(redirect, 1000);
		}
	};
	redirect();
</script>

<main>
	<a href="/" class="logolink">
		<div class="logo"><img src="/logo-header.png" alt="logo" /></div>
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
