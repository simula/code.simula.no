import fs from 'fs'
import matter from 'gray-matter'
import { validateFrontmatter } from './repo-schema.js'

let cache = null

// Reads /code once per build. Node module evaluation caches this
// module, so repeated calls across getStaticProps invocations are free
// after the first.
export function loadAllRepos() {
    if (cache) return cache

    const dir = 'code'
    const files = fs.readdirSync(dir)

    cache = files.map(fileName => {
        const slug = fileName.replace('.md', '')
        const filepath = `${dir}/${fileName}`
        const raw = fs.readFileSync(filepath, 'utf-8')
        const stats = fs.statSync(filepath)
        const { data: rawFrontmatter, content } = matter(raw)
        const frontmatter = validateFrontmatter(slug, rawFrontmatter)
        frontmatter.mtime = stats.mtime.toISOString()
        return { slug, frontmatter, content }
    })

    return cache
}

export function loadRepo(slug) {
    return loadAllRepos().find(r => r.slug === slug)
}
