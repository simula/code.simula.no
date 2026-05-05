import { z } from 'zod'
import { DOMAIN_TAGS, TYPE_TAGS, LANGUAGE_TAGS } from '../data/tags.js'

// Schema for repo frontmatter (the YAML block at the top of each
// code/<slug>.md file). Enforced by loadAllRepos() and by the
// repo-validation integration test, so every contribution path —
// build, dev, CI — fails fast on bad data.
//
// `mtime` is attached by the loader after parsing, so it is not part of
// the contributor-supplied schema.

const optionalUrlOrEmpty = z
    .string()
    .refine(v => v === '' || /^https?:\/\//.test(v), {
        message: 'must be a http(s) URL or an empty string',
    })
    .optional()

export const repoFrontmatterSchema = z
    .object({
        title: z.string().min(1, 'title is required'),
        desc: z.string().min(1, 'desc is required'),
        thumbnail: z.string().min(1).optional(),
        publication: optionalUrlOrEmpty,
        github: optionalUrlOrEmpty,
        homepage: optionalUrlOrEmpty,
        domain: z.array(z.enum(DOMAIN_TAGS)).default([]),
        type: z.array(z.enum(TYPE_TAGS)).default([]),
        language: z.array(z.enum(LANGUAGE_TAGS)).default([]),
        hidden: z.boolean().optional(),
    })
    .strict()
    .refine(d => d.domain.length + d.type.length + d.language.length > 0, {
        message: 'at least one tag is required (domain, type, or language)',
        path: ['domain'],
    })
    .refine(d => Boolean(d.github) || Boolean(d.homepage), {
        message: 'at least one of github or homepage is required',
        path: ['github'],
    })

export function validateFrontmatter(slug, frontmatter) {
    const { mtime: _mtime, ...rest } = frontmatter
    const result = repoFrontmatterSchema.safeParse(rest)
    if (result.success) return result.data
    const issues = result.error.issues
        .map(i => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
        .join('\n')
    throw new Error(
        `Invalid repo frontmatter in code/${slug}.md:\n${issues}`
    )
}
