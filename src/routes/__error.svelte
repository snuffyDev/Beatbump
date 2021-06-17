<script>
	import { goto } from '$app/navigation'

	$: redir = 5
	const redirect = () => {
		redir = redir - 1
		if (redir < 0) {
			goto('/')
		} else {
			setTimeout(redirect, 1000)
		}
	}
	redirect()
</script>

<main>
	<div class="logo"><img src="/logo-header.png" alt="logo" /></div>
	<h1>Uh-Oh!</h1>
	<h5>Looks like you hit a dead end!</h5>
	<p>Don't worry though, we got you covered.</p>
	<em>Redirecting in {redir}</em>
</main>

<style lang="scss">
	main {
		text-align: center;
		font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS',
			sans-serif;
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
