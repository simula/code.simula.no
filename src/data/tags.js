// Curated tag taxonomy for code repository frontmatter.
//
// Adding a new tag is an explicit, reviewed change: append an entry
// here in the same PR that introduces a repo using it. The schema
// in src/utils/repo-schema.js rejects any tag not in the per-facet
// list it derives from this file.
//
// Tags are split across three facets so the filter UI can present them
// as separate axes (Domain × Type × Language) instead of one flat list.

export const TAG_DEFINITIONS = [
    { tag: 'medical-imaging',   label: 'Medical imaging',         category: 'domain'   },
    { tag: 'networking',        label: 'Networking',              category: 'domain'   },
    { tag: 'multimedia',        label: 'Multimedia',              category: 'domain'   },
    { tag: 'sports-analytics',  label: 'Sports analytics',        category: 'domain'   },
    { tag: 'simulation',        label: 'Simulation',              category: 'domain'   },
    { tag: 'systems',           label: 'Systems & tooling',       category: 'domain'   },
    { tag: 'ml-infrastructure', label: 'ML infrastructure',       category: 'domain'   },
    { tag: 'library',           label: 'Library',                 category: 'type'     },
    { tag: 'cli-tool',          label: 'CLI tool',                category: 'type'     },
    { tag: 'model',             label: 'Model',                   category: 'type'     },
    { tag: 'framework',         label: 'Framework',               category: 'type'     },
    { tag: 'sim-model',         label: 'Simulation model',        category: 'type'     },
    { tag: 'dashboard',         label: 'Dashboard',               category: 'type'     },
    { tag: 'scripts',           label: 'Scripts',                 category: 'type'     },
    { tag: 'python',            label: 'Python',                  category: 'language' },
    { tag: 'c',                 label: 'C',                       category: 'language' },
    { tag: 'cpp',               label: 'C++',                     category: 'language' },
    { tag: 'shell',             label: 'Shell',                   category: 'language' },
    { tag: 'javascript',        label: 'JavaScript',              category: 'language' },
    { tag: 'r',                 label: 'R',                       category: 'language' },
    { tag: 'polyglot',          label: 'Polyglot',                category: 'language' },
]

const tagsByCategory = category =>
    TAG_DEFINITIONS.filter(t => t.category === category).map(t => t.tag)

export const DOMAIN_TAGS = tagsByCategory('domain')
export const TYPE_TAGS = tagsByCategory('type')
export const LANGUAGE_TAGS = tagsByCategory('language')

export const TAG_CATEGORY = Object.fromEntries(
    TAG_DEFINITIONS.map(t => [t.tag, t.category])
)

export const TAG_LABEL = Object.fromEntries(
    TAG_DEFINITIONS.map(t => [t.tag, t.label])
)

// Iteration order = display order in the filter UI.
export const FACETS = [
    { key: 'domain',   label: 'Domain',   tags: DOMAIN_TAGS,   field: 'domain'   },
    { key: 'type',     label: 'Type',     tags: TYPE_TAGS,     field: 'type'     },
    { key: 'language', label: 'Language', tags: LANGUAGE_TAGS, field: 'language' },
]
