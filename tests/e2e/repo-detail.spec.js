import { test, expect } from '@playwright/test'

test.describe('repo detail page', () => {
    test('navigating from a card lands on /[slug] with the repo content', async ({
        page
    }) => {
        await page.goto('/')
        const firstCardHeading = page
            .getByRole('heading', { level: 3 })
            .first()
        const title = (await firstCardHeading.textContent())?.trim()
        expect(title).toBeTruthy()
        await firstCardHeading.click()

        await expect(
            page.getByRole('heading', { level: 1, name: title })
        ).toBeVisible()
        await expect(page).toHaveURL(/^http:\/\/[^/]+\/[a-z0-9-]+/)
    })

    test('breadcrumb returns to the home grid', async ({ page }) => {
        await page.goto('/')
        await page.getByRole('heading', { level: 3 }).first().click()
        await page
            .getByRole('link', { name: 'Back to all repositories' })
            .click()
        await expect(page).toHaveURL(/\/$/)
        await expect(
            page.getByRole('heading', { name: 'Simula Code' })
        ).toBeVisible()
    })

    test('tag link from detail navigates back to filtered home', async ({
        page
    }) => {
        // Find a card on home, navigate to its detail, click first tag.
        // Tag links route via per-facet query params (?domain=..., ?type=...,
        // ?language=...) instead of a single ?tag= param.
        await page.goto('/')
        await page.getByRole('heading', { level: 3 }).first().click()
        const tagLink = page.locator('header a[href^="/?"]').first()
        const href = await tagLink.getAttribute('href')
        expect(href).toMatch(/^\/\?(domain|type|language)=/)
        await tagLink.click()
        await expect(page).toHaveURL(/\/\?(domain|type|language)=/)
    })

    test('detail page emits a JSON-LD SoftwareSourceCode schema script', async ({
        page
    }) => {
        await page.goto('/')
        await page.getByRole('heading', { level: 3 }).first().click()
        const script = page.locator('script[type="application/ld+json"]')
        await expect(script).toHaveCount(1)
        const json = await script.textContent()
        const parsed = JSON.parse(json)
        expect(parsed['@context']).toBe('https://schema.org')
        expect(parsed['@type']).toBe('SoftwareSourceCode')
        expect(parsed.name).toBeTruthy()
        expect(parsed.url).toMatch(/^https:\/\/code\.simula\.no\//)
        expect(parsed.creator.name).toBe('Simula Research Laboratory')
        expect(parsed.isAccessibleForFree).toBe(true)
    })

    test('rendered markdown body has no <script> tags (sanitized)', async ({
        page
    }) => {
        await page.goto('/')
        await page.getByRole('heading', { level: 3 }).first().click()
        const articleScripts = await page.locator('article script').count()
        expect(articleScripts).toBe(0)
    })
})
