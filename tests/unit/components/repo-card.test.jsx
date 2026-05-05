import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RepoCard from '../../../src/components/repo-card'

const baseRepo = {
    slug: 'alpha',
    frontmatter: {
        title: 'Alpha Repo',
        desc: 'A medical imaging Python model.',
        thumbnail: '/thumbnails/alpha.png',
        publication: 'https://example.com/alpha-paper',
        github: 'https://github.com/example/alpha',
        homepage: 'https://example.com/alpha',
        domain: ['medical-imaging'],
        type: ['model'],
        language: ['python'],
        mtime: '2024-06-15T12:00:00Z'
    }
}

const make = overrides => ({
    ...baseRepo,
    frontmatter: { ...baseRepo.frontmatter, ...(overrides || {}) }
})

describe('RepoCard', () => {
    it('renders the title and description', () => {
        render(<RepoCard repo={baseRepo} />)
        expect(
            screen.getByRole('heading', { name: 'Alpha Repo' })
        ).toBeInTheDocument()
        expect(
            screen.getByText('A medical imaging Python model.')
        ).toBeInTheDocument()
    })

    it('links the card to /[slug]', () => {
        render(<RepoCard repo={baseRepo} />)
        const cardLink = screen
            .getByRole('heading', { name: 'Alpha Repo' })
            .closest('a')
        expect(cardLink).toHaveAttribute('href', '/alpha')
    })

    it('renders up to 3 tag buttons across all facets and an overflow chip when there are more', () => {
        const repo = make({
            domain: ['medical-imaging', 'networking'],
            type: ['model', 'library'],
            language: ['python']
        })
        render(<RepoCard repo={repo} />)
        // Domain first, then type, then language. So first 3 visible
        // are: medical-imaging, networking, model. Labels are friendly.
        expect(
            screen.getByRole('button', { name: 'Medical imaging' })
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Networking' })
        ).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Model' })).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Library' })).toBeNull()
        expect(screen.getByText('+2')).toBeInTheDocument()
    })

    it('does not show the overflow chip when there are 3 or fewer tags total', () => {
        const repo = make({
            domain: ['medical-imaging'],
            type: ['model'],
            language: ['python']
        })
        render(<RepoCard repo={repo} />)
        expect(screen.queryByText(/^\+\d/)).toBeNull()
    })

    it('omits the tag bar entirely when there are no tags in any facet', () => {
        const repo = make({ domain: [], type: [], language: [] })
        render(
            <RepoCard
                repo={make({
                    ...repo.frontmatter,
                    github: undefined,
                    homepage: undefined
                })}
            />
        )
        const buttons = screen.queryAllByRole('button')
        expect(buttons).toHaveLength(0)
    })

    it('calls onTagClick({ tag, facet }) when a tag button is clicked', async () => {
        const onTagClick = vi.fn()
        const user = userEvent.setup()
        render(<RepoCard repo={baseRepo} onTagClick={onTagClick} />)

        await user.click(
            screen.getByRole('button', { name: 'Medical imaging' })
        )
        expect(onTagClick).toHaveBeenCalledWith({
            tag: 'medical-imaging',
            facet: 'domain'
        })
        expect(onTagClick).toHaveBeenCalledTimes(1)
    })

    it('does not throw when a tag is clicked with no onTagClick handler', async () => {
        const user = userEvent.setup()
        render(<RepoCard repo={baseRepo} />)
        await expect(
            user.click(
                screen.getByRole('button', { name: 'Medical imaging' })
            )
        ).resolves.not.toThrow()
    })

    it('renders github and homepage icon links with the correct href', () => {
        render(<RepoCard repo={baseRepo} />)
        expect(
            screen.getByRole('link', {
                name: /GitHub repository for Alpha Repo/i
            })
        ).toHaveAttribute('href', 'https://github.com/example/alpha')
        expect(
            screen.getByRole('link', {
                name: /Visit homepage for Alpha Repo/i
            })
        ).toHaveAttribute('href', 'https://example.com/alpha')
    })

    it('omits github and homepage links when not provided in frontmatter', () => {
        const repo = make({ github: undefined, homepage: undefined })
        render(<RepoCard repo={repo} />)
        expect(
            screen.queryByRole('link', { name: /GitHub repository for/i })
        ).toBeNull()
        expect(
            screen.queryByRole('link', { name: /Visit homepage for/i })
        ).toBeNull()
    })

    it('renders the formatted month-year for the mtime', () => {
        const repo = make({ mtime: '2024-06-15T12:00:00Z' })
        render(<RepoCard repo={repo} />)
        expect(screen.getByText('Jun 2024')).toBeInTheDocument()
    })
})
