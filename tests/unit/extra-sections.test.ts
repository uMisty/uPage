import { expect, it } from 'vitest'
import { createServer } from 'vite'
import { configSchema } from '../../shared/config'
import { initialPages } from '../../shared/pages'
import demo from '../../public/site.config.json'

it('keeps the original layout and gives each page independent defaults', () => {
  const first = initialPages(configSchema.parse(demo))
  const second = initialPages(configSchema.parse(demo))
  first.pages[0].config.timeline.items[0].title = 'Changed'
  expect(second.pages[0].config.timeline.items[0].title).not.toBe('Changed')
  expect(first.pages[0].layout).toHaveLength(7)
  expect(configSchema.safeParse({ ...demo, links: { ...first.pages[0].config.links, items: [{ name: 'bad', description: '', icon: '', url: 'javascript:alert(1)' }] } }).success).toBe(false)
})

it('renders new sections, internal links and native FAQ into static HTML', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' })
  try {
    const { render } = await server.ssrLoadModule('/src/render-static.ts')
    const page = initialPages(configSchema.parse(demo)).pages[0]
    page.layout = ['timeline', 'articles', 'gallery', 'links', 'faq']
    page.config.articles.items[0].url = '/blog/hello/'
    page.config.textColors['timeline.title'] = '#31856C'
    const html = await render(page, { articles: [], fetchedAt: new Date().toISOString(), stale: false })
    for (const value of ['一路走来', '值得慢慢读', '收集一些瞬间', '互联网的好邻居', '你可能想知道', 'href="/blog/hello/"', '<details>', '<summary>', 'color:#31856C']) expect(html).toContain(value)
    expect(html).not.toMatch(/contenteditable|data-edit-|<script/)
    page.config.timeline.items = []
    const empty = await render(page, { articles: [], fetchedAt: '', stale: false })
    expect(empty).not.toContain('新的开始')
  } finally { await server.close() }
}, 30_000)
