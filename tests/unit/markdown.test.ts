import { describe, expect, it } from 'vitest'
import { configSchema } from '../../shared/config'
import { renderMarkdown } from '../../shared/markdown'
import { initialPages, pagesSchema } from '../../shared/pages'
import config from '../../public/site.config.json'

describe('Markdown sections and text colors', () => {
  it('renders headings, lists, tables, images and fenced code', () => {
    const html = renderMarkdown('## 标题\n\n**粗体**与[链接](/about/)\n\n- 条目\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n![图片](/assets/example.png)\n\n```js\nconst x = 1\n```')
    for (const fragment of ['<h2>标题</h2>', '<strong>粗体</strong>', 'href="/about/"', '<li>条目</li>', '<table>', 'src="/assets/example.png"', 'class="language-js"']) expect(html).toContain(fragment)
  })
  it('escapes HTML and rejects executable links', () => {
    const html = renderMarkdown('<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[x](javascript:alert(1))\n\n[x](jav&#x61;script:alert(1))')
    expect(html).not.toMatch(/<script|<img|href="javascript:/)
    expect(html).toContain('&lt;script&gt;')
  })
  it('loads old pages and validates independent Markdown instances', () => {
    const document = initialPages(configSchema.parse(config))
    expect(document.pages[0].config.textColors).toEqual({})
    const page = document.pages[0]
    page.config.markdownBlocks = {
      'markdown-first': { name: '第一篇', content: '# 第一篇', textColor: '#123456', background: '' },
      'markdown-second': { name: '第二篇', content: '# 第二篇', textColor: '', background: '#FFFFFF' },
    }
    page.layout.push('markdown-first', 'markdown-second')
    expect(pagesSchema.parse(document).pages[0].layout).toHaveLength(9)
    page.layout.push('markdown-missing')
    expect(pagesSchema.safeParse(document).success).toBe(false)
  })
  it('validates per-text color overrides', () => {
    expect(configSchema.safeParse({ ...config, textColors: { 'profile.name': '#7856C8' } }).success).toBe(true)
    expect(configSchema.safeParse({ ...config, textColors: { 'profile.name': 'red;display:none' } }).success).toBe(false)
  })
})
