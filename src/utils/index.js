import { FACETS } from '../data/tags.js'

const MONTH_YEAR = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric'
})

// Renders an absolute "Mon YYYY" label. Used in place of relative time
// strings so SSG output doesn't bake in stale "2 weeks ago" text that
// drifts out of sync with reality between deploys.
export function formatMonthYear(time) {
    if (!time) return ''
    const d = time instanceof Date ? time : new Date(time)
    if (Number.isNaN(d.getTime())) return ''
    return MONTH_YEAR.format(d)
}

export function allTagsFor(frontmatter) {
    return [
        ...(frontmatter.domain || []),
        ...(frontmatter.type || []),
        ...(frontmatter.language || []),
    ]
}

// Per-facet tag counts: { domain: { networking: 8, ... }, type: {...}, language: {...} }.
// Powers the option counts in each FacetDropdown.
export function countFacets(repos) {
    const counts = {}
    for (const { key, field } of FACETS) {
        const bucket = {}
        for (const r of repos) {
            for (const tag of r.frontmatter[field] || []) {
                bucket[tag] = (bucket[tag] || 0) + 1
            }
        }
        counts[key] = bucket
    }
    return counts
}

export function findRelatedRepos(target, allRepos, limit = 3) {
    const targetTags = new Set(allTagsFor(target.frontmatter))
    if (targetTags.size === 0) return []

    return allRepos
        .filter(r => r.slug !== target.slug && !r.frontmatter.hidden)
        .map(r => {
            const overlap = allTagsFor(r.frontmatter).filter(t =>
                targetTags.has(t)
            ).length
            return { repo: r, overlap }
        })
        .filter(x => x.overlap > 0)
        .sort((a, b) => b.overlap - a.overlap)
        .slice(0, limit)
        .map(x => x.repo)
}
