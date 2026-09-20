import { expect, it } from 'vitest'
import { createServer } from 'vite'
import { configSchema } from '../../shared/config'
import { initialPages } from '../../shared/pages'
import demo from '../../public/site.config.json'

it('exports text colors and repeated Markdown into static HTML without editor controls', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' })
  try {
    const { render } = await server.ssrLoadModule('/src/render-static.ts')
    const page = initialPages(configSchema.parse(demo)).pages[0]
    page.config.textColors = { 'profile.name': '#31856C', 'sections.projects.title': '#7856C8' }
    page.config.markdownBlocks = {
      'markdown-one': { name: '一', content: '## 第一段\n\n**粗体**', textColor: '#DC4965', background: '#FFFFFF' },
      'markdown-two': { name: '二', content: '## 第二段\n\n[链接](/about/)', textColor: '', background: '' },
    }
    page.layout = ['profile', 'markdown-two', 'projects', 'markdown-one']
    const html = await render(page, { articles: [], fetchedAt: new Date().toISOString(), stale: false })
    expect(html).toContain('color:#31856C')
    expect(html).toContain('color:#7856C8')
    expect(html).toContain('color:#DC4965;background:#FFFFFF')
    expect(html).toContain('<strong>粗体</strong>')
    expect(html).toContain('href="/about/"')
    expect(html.indexOf('第二段')).toBeLessThan(html.indexOf('第一段'))
    expect(html).not.toMatch(/contenteditable|data-edit-|<script/)
  } finally { await server.close() }
}, 30_000)
