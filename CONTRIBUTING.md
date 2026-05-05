# Contributing a repository

Repositories are added by pull request.

1. **Fork** the repo and create a branch.
2. **Create `code/<slug>.md`** with this frontmatter:

    ```markdown
    ---
    title: '<repository name>'
    desc: '<one-sentence description>'
    thumbnail: /thumbnails/<slug>.png   # optional
    github: <https://github.com/...>    # optional
    homepage: <https://...>             # optional
    publication: <https://...>          # optional
    domain:
      - <domain tag from src/data/tags.js>
    type:
      - <type tag from src/data/tags.js>
    language:
      - <language tag from src/data/tags.js>
    ---

    <full markdown description here>
    ```

3. **Provide at least one of `github` or `homepage`.** Both can coexist when the canonical homepage is separate from the source repo.
4. **Add a thumbnail** (optional) to `public/thumbnails/<slug>.png` (16:9, PNG or JPG — e.g. 640×360). The build pre-generates responsive webp variants.
5. **Pick tags from the curated list** in [`src/data/tags.js`](src/data/tags.js). Tags are split across three facets — `domain`, `type`, and `language` — and each frontmatter field only accepts tags from its own facet. At least one tag is required across the three. The schema rejects anything not in the curated list; if your repo truly needs a new tag, add an entry to `src/data/tags.js` in the same PR.
6. **Run `npm test`** locally — the schema validator runs as part of the test suite, so you'll see immediately if anything is wrong.
7. **Open a PR**. CI will re-run validation; once it's green, a maintainer will review and merge.
