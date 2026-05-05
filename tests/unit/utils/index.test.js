import { describe, it, expect } from 'vitest'
import {
    formatMonthYear,
    countFacets,
    findRelatedRepos
} from '../../../src/utils/index'

describe('formatMonthYear', () => {
    it('returns empty string for null/undefined/empty input', () => {
        expect(formatMonthYear(null)).toBe('')
        expect(formatMonthYear(undefined)).toBe('')
        expect(formatMonthYear('')).toBe('')
    })

    it('returns empty string for invalid date input', () => {
        expect(formatMonthYear('not-a-date')).toBe('')
        expect(formatMonthYear('2024-99-99')).toBe('')
    })

    it('formats an ISO date string as "Mon YYYY"', () => {
        expect(formatMonthYear('2024-01-15T12:00:00Z')).toBe('Jan 2024')
        expect(formatMonthYear('2024-07-04T12:00:00Z')).toBe('Jul 2024')
        expect(formatMonthYear('2025-12-15T12:00:00Z')).toBe('Dec 2025')
    })

    it('accepts a Date instance', () => {
        const d = new Date('2023-03-15T12:00:00Z')
        expect(formatMonthYear(d)).toBe('Mar 2023')
    })

    it('accepts a numeric timestamp (ms since epoch)', () => {
        const ts = Date.UTC(2022, 5, 15, 12)
        expect(formatMonthYear(ts)).toBe('Jun 2022')
    })
})

describe('countFacets', () => {
    const empty = { domain: {}, type: {}, language: {} }

    it('returns empty per-facet objects for an empty array', () => {
        expect(countFacets([])).toEqual(empty)
    })

    it('returns empty per-facet objects when no repos carry tags', () => {
        const repos = [
            { frontmatter: { title: 'A' } },
            { frontmatter: { title: 'B', domain: [], type: [], language: [] } }
        ]
        expect(countFacets(repos)).toEqual(empty)
    })

    it('counts repeated tags within their facet', () => {
        const repos = [
            { frontmatter: { domain: ['networking'], type: ['cli-tool'] } },
            { frontmatter: { domain: ['networking'], type: ['library'] } },
            { frontmatter: { domain: ['systems'], type: ['cli-tool'] } }
        ]
        expect(countFacets(repos)).toEqual({
            domain: { networking: 2, systems: 1 },
            type: { 'cli-tool': 2, library: 1 },
            language: {}
        })
    })

    it('treats missing facet arrays as no contribution', () => {
        const repos = [
            { frontmatter: { domain: ['networking'] } },
            { frontmatter: {} },
            {
                frontmatter: {
                    domain: ['networking', 'systems'],
                    language: ['cpp']
                }
            }
        ]
        expect(countFacets(repos)).toEqual({
            domain: { networking: 2, systems: 1 },
            type: {},
            language: { cpp: 1 }
        })
    })
})

describe('findRelatedRepos', () => {
    const mk = (
        slug,
        { domain = [], type = [], language = [], hidden = false } = {}
    ) => ({
        slug,
        frontmatter: { title: slug, domain, type, language, hidden }
    })

    it('returns [] when the target has no tags across any facet', () => {
        const target = mk('target')
        const all = [
            mk('a', { domain: ['networking'] }),
            mk('b', { type: ['model'] })
        ]
        expect(findRelatedRepos(target, all)).toEqual([])
    })

    it('returns [] when the target has no facet fields at all', () => {
        const target = { slug: 'target', frontmatter: { title: 'target' } }
        const all = [mk('a', { domain: ['networking'] })]
        expect(findRelatedRepos(target, all)).toEqual([])
    })

    it('excludes the target itself by slug', () => {
        const target = mk('target', { domain: ['networking'] })
        const all = [
            mk('target', { domain: ['networking'] }),
            mk('other', { domain: ['networking'] })
        ]
        const result = findRelatedRepos(target, all)
        expect(result).toHaveLength(1)
        expect(result[0].slug).toBe('other')
    })

    it('excludes hidden repos', () => {
        const target = mk('target', { domain: ['networking'] })
        const all = [
            mk('vis', { domain: ['networking'] }),
            mk('hid', { domain: ['networking'], hidden: true })
        ]
        const result = findRelatedRepos(target, all)
        expect(result.map(r => r.slug)).toEqual(['vis'])
    })

    it('sorts by overlap descending across all facets combined', () => {
        const target = mk('target', {
            domain: ['networking'],
            type: ['cli-tool'],
            language: ['cpp']
        })
        const all = [
            mk('one-overlap', { domain: ['networking'] }),
            mk('three-overlap', {
                domain: ['networking'],
                type: ['cli-tool'],
                language: ['cpp']
            }),
            mk('two-overlap', {
                domain: ['networking'],
                type: ['cli-tool']
            })
        ]
        const result = findRelatedRepos(target, all)
        expect(result.map(r => r.slug)).toEqual([
            'three-overlap',
            'two-overlap',
            'one-overlap'
        ])
    })

    it('respects the limit argument', () => {
        const target = mk('target', { domain: ['networking'] })
        const all = [
            mk('one', { domain: ['networking'] }),
            mk('two', { domain: ['networking'] }),
            mk('three', { domain: ['networking'] }),
            mk('four', { domain: ['networking'] })
        ]
        expect(findRelatedRepos(target, all, 2)).toHaveLength(2)
        expect(findRelatedRepos(target, all, 1)).toHaveLength(1)
    })

    it('defaults the limit to 3', () => {
        const target = mk('target', { domain: ['networking'] })
        const all = [
            mk('one', { domain: ['networking'] }),
            mk('two', { domain: ['networking'] }),
            mk('three', { domain: ['networking'] }),
            mk('four', { domain: ['networking'] })
        ]
        expect(findRelatedRepos(target, all)).toHaveLength(3)
    })

    it('returns [] when no candidate shares any tag in any facet', () => {
        const target = mk('target', { domain: ['networking'] })
        const all = [
            mk('x', { domain: ['systems'] }),
            mk('y', { type: ['scripts'] })
        ]
        expect(findRelatedRepos(target, all)).toEqual([])
    })
})
