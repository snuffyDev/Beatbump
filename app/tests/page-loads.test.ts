import { test, expect, type Locator } from "@playwright/test";

test.describe("pages", () => {
	test("home page loads", async ({ page }) => {
		await page.goto("/home");

		const main = page.getByTestId("home");

		await expect(main).toBeVisible();
	});

	test("artist page loads (pink floyd)", async ({ page }) => {
		await page.goto("/artist/UCO6LS_5W7vqG9mALDNzSFug");
		const name = page.locator(".name");

		await expect(name).toContainText(/pink floyd/i);
	});

	test("trending page loads", async ({ page }) => {
		await page.goto("/trending");

		const main = page.getByTestId("trending");

		await expect(main).toBeVisible();
	});
	test("release page loads", async ({ page }) => {
		await page.goto("/release?type=MUSIC_PAGE_TYPE_ALBUM&id=MPREb_gKCCmUjLfwo");

		const main = page.getByTestId("release");

		await expect(main).toBeVisible({ timeout: 10000 });
	});
});

test.describe("user journey", () => {
	test("test search navigation + search works", async ({ page }) => {
		await page.goto("/home");
		await page.getByRole("button", { name: "Search" }).click();
		await page.getByPlaceholder("Search").fill("Aphex Twin");
		await page.getByPlaceholder("Search").press("Enter");
		const firstAphexTwin = await page.getByText("Aphex Twin").first();

		await expect(firstAphexTwin).toContainText("Aphex Twin");
	});

	test("playlist page has expected related section", async ({ page }) => {
		await page.goto("/playlist/VLRDCLAK5uy_nZiG9ehz_MQoWQxY5yElsLHCcG0tv9PRg");
		const main = page.locator("#wrapper");
		let relatedPlaylistSection: Locator;

		while (!(await main.locator("footer").isVisible())) await main.locator("footer").scrollIntoViewIfNeeded();

		if (main.getByRole("main").locator("div").filter({ hasText: "Related playlists" })) {
			relatedPlaylistSection = await main.getByRole("main").locator("div").filter({ hasText: "Related playlists" });
		}

		await expect(relatedPlaylistSection).toBeVisible();
	});
});
