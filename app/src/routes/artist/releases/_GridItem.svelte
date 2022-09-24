<script lang="ts">
	import { goto } from "$app/navigation";
	import lazy from "$lib/lazy";

	export let item;
</script>

<div class="item" on:click={() => goto("/release?id=" + item.endpoint.browseId)}>
	<div class="img">
		<img
			loading="lazy"
			on:error={(e) => {
				e.currentTarget.onerror = null;
				e.currentTarget.src =
					"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSJpc29sYXRpb246aXNvbGF0ZSIgdmlld0JveD0iMCAwIDI1NiAyNTYiIHdpZHRoPSIyNTZwdCIgaGVpZ2h0PSIyNTZwdCI+PGRlZnM+PGNsaXBQYXRoIGlkPSJwcmVmaXhfX2EiPjxwYXRoIGQ9Ik0wIDBoMjU2djI1NkgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNwcmVmaXhfX2EpIj48cGF0aCBmaWxsPSIjNDI0MjQyIiBkPSJNMCAwaDI1NnYyNTZIMHoiLz48ZyBjbGlwLXBhdGg9InVybCgjcHJlZml4X19iKSI+PHRleHQgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTA1LjU0IDE2Ni43OTQpIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLC1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LCZxdW90O1NlZ29lIFVJJnF1b3Q7LFJvYm90byxPeHlnZW4sVWJ1bnR1LENhbnRhcmVsbCwmcXVvdDtPcGVuIFNhbnMmcXVvdDssJnF1b3Q7SGVsdmV0aWNhIE5ldWUmcXVvdDssc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjQwMCIgZm9udC1zaXplPSIxMDAiIGZpbGw9IiNmYWZhZmEiPj88L3RleHQ+PC9nPjxkZWZzPjxjbGlwUGF0aCBpZD0icHJlZml4X19iIj48cGF0aCB0cmFuc2Zvcm09InRyYW5zbGF0ZSg5MiA1NC44MzkpIiBkPSJNMCAwaDcydjE0Ni4zMjNIMHoiLz48L2NsaXBQYXRoPjwvZGVmcz48L2c+PC9zdmc+";
			}}
			use:lazy={{ src: item.thumbnails[0].url }}
			src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0icHJlZml4X19wcmVmaXhfX2ZlYXRoZXIgcHJlZml4X19wcmVmaXhfX2ZlYXRoZXItbGlzdCI+PHBhdGggb3BhY2l0eT0iLjciIHN0cm9rZT0iI2NjYyIgZmlsbD0iIzMzMyIgZD0iTTAgMGgyNHYyNEgweiIvPjwvc3ZnPg=="
			alt="thumbnail"
		/>
	</div>
	<div class="item-title">{item.title}</div>
</div>

<style lang="scss">
	.item {
		display: flex;
		flex-wrap: nowrap;
		flex-direction: column;

		justify-content: flex-start;

		cursor: pointer;
		border-radius: 0.4rem;
		padding: 0.5rem 0.4rem 0.4rem;
		position: relative;
		width: 100%;
		.img {
			width: 100%;
			margin-bottom: 0.5em;
		}
	}
	.item-title {
		display: inline;
		padding: 0.3rem 0.1rem;
		font-family: "CommissionerVariable";
		font-weight: 500;
		font-size: 1.1em;
		letter-spacing: -0.02em;
		margin-bottom: 0.5em;
	}
	@media screen and (min-width: 25em) and (max-width: 37em) {
		.item {
			max-width: 14rem;
		}
	}
	@media screen and (min-width: 37em) and (max-width: 48em) {
		.item {
			max-width: 13rem;
		}
	}
	@media screen and (min-width: 48em) {
		.item {
			max-width: 14rem;
		}
	}
</style>
