<script lang="ts">
	import { mobileLongPress } from "$lib/actions/longtouch";
	let style = "--progress: 0";
	let pressing = false;
</script>

<main>
	<div
		class="TEST"
		{style}
		on:contextmenu|preventDefault={() => {}}
		use:mobileLongPress
		on:pressing={(e) => {
			pressing = true;
			console.log(e);
			style = `--progress: ${e.detail.progress}`;
		}}
		on:pressEnd={(e) => {
			style = `--progress: 0`;
			pressing = false;

			console.log(e);
		}}
	>
		<h1>TEST CONTENT</h1>
		<!-- <img src="/logo.png" /> -->
	</div>
</main>

<!-- markup (zero or more items) goes here -->
<style lang="scss">
	/* your styles go here */
	.TEST {
		position: relative;
		border: hsla(0, 100%, 100%, 0.5) 1px solid;
	}

	.TEST {
		overflow: hidden;

		&::before {
			content: "";
			background-clip: padding-box;
			position: absolute;
			inset: 0;
			background-size: 0%;

			opacity: var(--progress);
			transform: scale(var(--progress));
			background: hsla(0, 100%, 100%, 0.2) radial-gradient(circle, hsla(0, 100%, 100%, 0.2) 1%, #0000 1%) center/15000%;
			// transition: cubic-bezier(0.55, 0, 1, 0.45) 400ms;

			transition: cubic-bezier(0, 0.55, 0.45, 1) 400ms 200ms background,
				cubic-bezier(0, 0.55, 0.45, 1) 400ms 200ms transform, cubic-bezier(0, 0.55, 0.45, 1) 800ms 200ms opacity;

			transition-duration: 500ms;
			transition-delay: 0ms;
			// border-radius: 50%;
		}
		&:active::before {
			// transition-property: transform, opacity;
			transition-delay: 0ms;
			background-color: hsla(0, 100%, 100%, 0.2);
			transition: cubic-bezier(0.55, 0, 1, 0.45) 400ms;
			transition-property: transform, opacity, background;
			// transition-property: transform, opacity, background;
			background-size: 150%;
		}
	}
</style>
