import path from 'path'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// See sibling index.getStaticProps.test.js for the chdir + resetModules
// rationale.
const FIXTURES_ROOT = path.resolve(__dirname, '..', 'fixtures')

let originalCwd

beforeEach(() => {
    originalCwd = process.cwd()
    process.chdir(FIXTURES_ROOT)
    vi.resetModules()
})

afterEach(() => {
    process.chdir(originalCwd)
})

describe('repo detail getStaticPaths', () => {
    it('returns one path per fixture repo, fallback: false', async () => {
        const mod = await import('../../src/pages/[slug]')
        const { paths, fallback } = await mod.getStaticPaths()
        expect(fallback).toBe(false)
        const slugs = paths.map(p => p.params.slug).sort()
        expect(slugs).toEqual(['alpha', 'beta', 'delta', 'gamma'])
    })
})

describe('repo detail getStaticProps', () => {
    it('returns slug, frontmatter, html, and related as props', async () => {
        const mod = await import('../../src/pages/[slug]')
        const result = await mod.getStaticProps({ params: { slug: 'alpha' } })
        expect(result.props).toMatchObject({
            slug: 'alpha',
            frontmatter: expect.objectContaining({
                title: 'Alpha Repo',
                domain: ['medical-imaging'],
                type: ['model'],
                language: ['python']
            })
        })
        expect(typeof result.props.html).toBe('string')
        expect(Array.isArray(result.props.related)).toBe(true)
    })

    it('renders the markdown body into HTML', async () => {
        const mod = await import('../../src/pages/[slug]')
        const { props } = await mod.getStaticProps({
            params: { slug: 'alpha' }
        })
        expect(props.html).toContain('<h1>Alpha</h1>')
        expect(props.html).toContain('<strong>alpha</strong>')
    })

    it('strips dangerous content from the markdown body', async () => {
        const mod = await import('../../src/pages/[slug]')
        const { props } = await mod.getStaticProps({
            params: { slug: 'delta' }
        })
        // Delta fixture intentionally embeds a <script> and a
        // javascript: link. Both must be gone from the output.
        expect(props.html).not.toContain('<script')
        expect(props.html).not.toContain("alert('xss-from-delta')")
        expect(props.html).not.toContain('javascript:')
        // Allowed raw HTML — the <table> — survives.
        expect(props.html).toContain('<table>')
        expect(props.html).toContain('<th>Column</th>')
    })

    it('finds related repos by tag overlap, excluding the target itself', async () => {
        const mod = await import('../../src/pages/[slug]')
        const { props } = await mod.getStaticProps({
            params: { slug: 'gamma' }
        })
        // Gamma is tagged domain=networking, type=model, language=python.
        // alpha shares type=model + language=python; delta shares
        // domain=networking; beta is hidden so excluded.
        const slugs = props.related.map(r => r.slug)
        expect(slugs).toContain('alpha')
        expect(slugs).toContain('delta')
        expect(slugs).not.toContain('gamma')
        expect(slugs).not.toContain('beta')
    })

    it('strips the markdown body from related entries', async () => {
        const mod = await import('../../src/pages/[slug]')
        const { props } = await mod.getStaticProps({
            params: { slug: 'alpha' }
        })
        for (const r of props.related) {
            expect(r).not.toHaveProperty('content')
            expect(Object.keys(r).sort()).toEqual(['frontmatter', 'slug'])
        }
    })

    it('returns at most 3 related repos', async () => {
        const mod = await import('../../src/pages/[slug]')
        const { props } = await mod.getStaticProps({
            params: { slug: 'gamma' }
        })
        expect(props.related.length).toBeLessThanOrEqual(3)
    })

    it('returns related candidates for a hidden target whose tags overlap with visible repos', async () => {
        // beta is the only fixture with hidden:true; its single tag
        // (domain=medical-imaging) is shared with alpha — so beta
        // SHOULD have related=[alpha]. Hidden repos still get related
        // lookups; only their candidates are filtered.
        const mod = await import('../../src/pages/[slug]')
        const { props } = await mod.getStaticProps({
            params: { slug: 'beta' }
        })
        const slugs = props.related.map(r => r.slug)
        expect(slugs).toContain('alpha')
        expect(slugs).not.toContain('beta')
    })
})
