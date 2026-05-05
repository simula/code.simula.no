import path from 'path'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// loadAllRepos caches at module level. We use vi.resetModules() to get
// a fresh cache per test, and chdir into the fixtures dir so `code`
// (the relative path baked into the loader) resolves to our fixtures.
const FIXTURES_DIR = path.resolve(__dirname, '..', '..', 'fixtures')

let originalCwd

beforeEach(() => {
    originalCwd = process.cwd()
    process.chdir(FIXTURES_DIR)
    vi.resetModules()
})

afterEach(() => {
    process.chdir(originalCwd)
})

describe('loadAllRepos', () => {
    it('reads every .md file in code/ and returns slug + frontmatter + content', async () => {
        const { loadAllRepos } = await import('../../../src/utils/repos')
        const all = loadAllRepos()

        expect(all).toHaveLength(4)
        const slugs = all.map(r => r.slug).sort()
        expect(slugs).toEqual(['alpha', 'beta', 'delta', 'gamma'])

        const alpha = all.find(r => r.slug === 'alpha')
        expect(alpha.frontmatter.title).toBe('Alpha Repo')
        expect(alpha.frontmatter.domain).toEqual(['medical-imaging'])
        expect(alpha.frontmatter.type).toEqual(['model'])
        expect(alpha.frontmatter.language).toEqual(['python'])
        expect(alpha.content).toContain('alpha')
    })

    it('attaches an ISO-string mtime to each frontmatter', async () => {
        const { loadAllRepos } = await import('../../../src/utils/repos')
        const all = loadAllRepos()

        for (const r of all) {
            expect(typeof r.frontmatter.mtime).toBe('string')
            expect(Number.isNaN(Date.parse(r.frontmatter.mtime))).toBe(false)
        }
    })

    it('preserves frontmatter.hidden so callers can filter on it', async () => {
        const { loadAllRepos } = await import('../../../src/utils/repos')
        const all = loadAllRepos()
        const beta = all.find(r => r.slug === 'beta')
        expect(beta.frontmatter.hidden).toBe(true)
    })

    it('returns the cached array on subsequent calls (same reference)', async () => {
        const { loadAllRepos } = await import('../../../src/utils/repos')
        const a = loadAllRepos()
        const b = loadAllRepos()
        expect(b).toBe(a)
    })
})

describe('loadRepo', () => {
    it('returns the repo matching the given slug', async () => {
        const { loadRepo } = await import('../../../src/utils/repos')
        const gamma = loadRepo('gamma')
        expect(gamma).toBeDefined()
        expect(gamma.slug).toBe('gamma')
        expect(gamma.frontmatter.title).toBe('Gamma Repo')
        expect(gamma.content).toContain('Gamma')
    })

    it('returns undefined for an unknown slug', async () => {
        const { loadRepo } = await import('../../../src/utils/repos')
        expect(loadRepo('nonexistent')).toBeUndefined()
    })
})
