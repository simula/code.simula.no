import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { describe, it, expect } from 'vitest'

import { repoFrontmatterSchema } from '../../src/utils/repo-schema.js'

// Walks the real code/ directory (not the fixtures) and asserts every
// .md file's frontmatter matches the schema. Runs in CI via `npm test`
// (.github/workflows/test.yaml), so any malformed contribution fails the
// PR build before a maintainer ever has to read it.
const CODE_DIR = path.resolve(__dirname, '..', '..', 'code')

const files = fs
    .readdirSync(CODE_DIR)
    .filter(f => f.endsWith('.md'))
    .sort()

describe('every repo in /code passes schema validation', () => {
    it.each(files)('%s', fileName => {
        const raw = fs.readFileSync(path.join(CODE_DIR, fileName), 'utf-8')
        const { data: frontmatter } = matter(raw)
        const result = repoFrontmatterSchema.safeParse(frontmatter)
        if (!result.success) {
            const detail = result.error.issues
                .map(i => `${i.path.join('.') || '(root)'}: ${i.message}`)
                .join('; ')
            throw new Error(`${fileName} → ${detail}`)
        }
        expect(result.success).toBe(true)
    })

    it('the directory contains at least one repo', () => {
        expect(files.length).toBeGreaterThan(0)
    })
})
