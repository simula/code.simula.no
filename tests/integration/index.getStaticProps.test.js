import path from 'path'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Run getStaticProps against the fixture code/ tree. Uses chdir so
// the relative `code` path inside loadAllRepos resolves to our
// tests/fixtures/code/ instead of the real repo data, and
// resetModules so the module-level cache in repos.js doesn't carry
// between tests.
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

describe('home page getStaticProps', () => {
    it('returns repos and facetCounts as props', async () => {
        const { getStaticProps } = await import('../../src/pages/index')
        const result = await getStaticProps()

        expect(result).toHaveProperty('props')
        expect(result.props).toHaveProperty('repos')
        expect(result.props).toHaveProperty('facetCounts')
    })

    it('includes hidden repos in props.repos (so the client can re-derive)', async () => {
        const { getStaticProps } = await import('../../src/pages/index')
        const { props } = await getStaticProps()
        const slugs = props.repos.map(r => r.slug).sort()
        expect(slugs).toEqual(['alpha', 'beta', 'delta', 'gamma'])
    })

    it('strips the markdown body from each repo entry to keep static props small', async () => {
        const { getStaticProps } = await import('../../src/pages/index')
        const { props } = await getStaticProps()
        for (const r of props.repos) {
            expect(r).not.toHaveProperty('content')
            expect(Object.keys(r).sort()).toEqual(['frontmatter', 'slug'])
        }
    })

    it('counts tags per facet across visible repos only (excludes hidden)', async () => {
        const { getStaticProps } = await import('../../src/pages/index')
        const { props } = await getStaticProps()
        // Fixtures: alpha=[medical-imaging, model, python] visible,
        // beta=[medical-imaging] hidden, gamma=[networking, model, python]
        // visible, delta=[networking] visible. Hidden beta does NOT count.
        expect(props.facetCounts).toEqual({
            domain: { 'medical-imaging': 1, networking: 2 },
            type: { model: 2 },
            language: { python: 2 }
        })
    })

    it('attaches an ISO-string mtime to each repo frontmatter', async () => {
        const { getStaticProps } = await import('../../src/pages/index')
        const { props } = await getStaticProps()
        for (const r of props.repos) {
            expect(typeof r.frontmatter.mtime).toBe('string')
            expect(Number.isNaN(Date.parse(r.frontmatter.mtime))).toBe(false)
        }
    })
})
