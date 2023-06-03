<script lang="ts">
	import Button from "$lib/components/Button";
	import { alertHandler } from "$stores/stores";

	let style = "--progress: 0";
	let pressing = false;
	let n = 0;
</script>

<main>
	<Button
		on:click={() => {
			alertHandler.add({ msg: `${++n}`, type: n % 2 ? "error" : "success" });
		}}>Wow</Button
	>
	<div
		class="TEST"
		{style}
		on:contextmenu|preventDefault={() => {}}
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
		border: hsl(0deg 100% 100% / 50%) 1px solid;
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
			background: hsl(0deg 100% 100% / 20%)
				radial-gradient(circle, hsl(0deg 100% 100% / 20%) 1%, #0000 1%)
				center/15000%;
			// transition: cubic-bezier(0.55, 0, 1, 0.45) 400ms;transition

			transition: cubic-bezier(0, 0.55, 0.45, 1) 400ms 200ms background,
				cubic-bezier(0, 0.55, 0.45, 1) 400ms 200ms transform,
				cubic-bezier(0, 0.55, 0.45, 1) 800ms 200ms opacity;
			transition-duration: 500ms;
			transition-delay: 0ms;
			// border-radius: 50%;border-radius
		}

		&:active::before {
			// transition-property: transform, opacity;transition-property
			transition-delay: 0ms;
			background-color: hsl(0deg 100% 100% / 20%);
			transition: cubic-bezier(0.55, 0, 1, 0.45) 400ms;
			transition-property: transform, opacity, background;
			// transition-property: transform, opacity, background;transition-property
			background-size: 150%;
		}
	}
</style>
