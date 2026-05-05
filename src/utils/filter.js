import { FACETS } from '../data/tags.js'

export const VALID_SORTS = ['recent', 'az', 'za']

const FACET_KEYS = FACETS.map(f => f.key)

// Read URL query params into a normalized filter state. Each facet has
// its own repeatable param (?domain=networking&language=cpp) so the three
// dimensions are independently shareable in the URL.
export function readFilterState(searchString) {
    const sp = new URLSearchParams(searchString || '')
    const sort = sp.get('sort')
    const facets = {}
    for (const key of FACET_KEYS) facets[key] = sp.getAll(key)
    return {
        q: sp.get('q') || '',
        facets,
        sort: VALID_SORTS.includes(sort) ? sort : 'recent',
    }
}

// AND across facets, OR within each facet — the standard faceted-search
// semantic. Selecting `domain=networking domain=systems` finds networking-OR-systems
// repos; adding `type=cli-tool` narrows that to ones that ALSO have type cli-tool.
export function filterRepos({ repos, search, facets }) {
    const needle = (search || '').toLowerCase().trim()
    const safeFacets = facets || {}

    return repos.filter(r => {
        for (const { key, field } of FACETS) {
            const selected = safeFacets[key] || []
            if (selected.length === 0) continue
            const rValues = r.frontmatter[field] || []
            if (!selected.some(t => rValues.includes(t))) return false
        }
        if (!needle) return true
        const fm = r.frontmatter
        const allTags = [
            ...(fm.domain || []),
            ...(fm.type || []),
            ...(fm.language || []),
        ]
        return (
            fm.title.toLowerCase().includes(needle) ||
            fm.desc?.toLowerCase().includes(needle) ||
            allTags.some(t => t.toLowerCase().includes(needle))
        )
    })
}

export function sortRepos(repos, sort) {
    const out = repos.slice()
    if (sort === 'az') {
        out.sort((a, b) =>
            a.frontmatter.title.localeCompare(b.frontmatter.title)
        )
    } else if (sort === 'za') {
        out.sort((a, b) =>
            b.frontmatter.title.localeCompare(a.frontmatter.title)
        )
    } else {
        out.sort(
            (a, b) =>
                new Date(b.frontmatter.mtime).getTime() -
                new Date(a.frontmatter.mtime).getTime()
        )
    }
    return out
}
