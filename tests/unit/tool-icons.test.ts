import { expect, it } from 'vitest'
import { createServer } from 'vite'
import { configSchema, toolIconSchema } from '../../shared/config'
import { getToolIcon } from '../../shared/tool-icons'
import { initialPages } from '../../shared/pages'
import demo from '../../public/site.config.json'

it('accepts existing images and bundled icons while rejecting missing icons and unsafe sources', () => {
  for (const value of ['', '/assets/tool.svg', 'https://example.com/tool.png', 'lucide:wrench', 'simple-icons:vuedotjs']) expect(toolIconSchema.safeParse(value).success).toBe(true)
  for (const value of ['lucide:missing-icon', 'other:vue', 'javascript:alert(1)', 'data:image/svg+xml,<svg/>', 'lucide:constructor', 'lucide:wrench:extra']) expect(toolIconSchema.safeParse(value).success).toBe(false)
})

it('renders library icons as inline SVG alongside existing images in static HTML', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' })
  try {
    const { render } = await server.ssrLoadModule('/src/render-static.ts')
    const page = initialPages(configSchema.parse(demo)).pages[0]
    page.layout = ['tools']
    page.config.toolGroups = [{ name: 'Icons', items: [
      { name: 'Vue', purpose: '', icon: 'simple-icons:vuedotjs', mark: '', url: '' },
      { name: 'Code', purpose: '', icon: 'lucide:code', mark: '', url: '' },
      { name: 'Image', purpose: '', icon: '/assets/example.svg', mark: '', url: '' },
    ] }]
    const html = await render(page, { articles: [], fetchedAt: '', stale: false })
    expect(html.match(/<svg /g)).toHaveLength(2)
    expect(html).toContain(getToolIcon('simple-icons:vuedotjs')!.body)
    expect(html).toContain('src="/assets/example.svg"')
    expect(html).not.toMatch(/data-edit-|<script|api.iconify/)
  } finally { await server.close() }
}, 30_000)
