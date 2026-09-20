import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createServer } from 'vite'
import { createFeedService } from '../server/feed-service'
import { loadPages } from '../server/editor'

const root = resolve('dist')
const document = await loadPages(resolve('public'))
const template = await readFile(resolve(root, 'index.html'), 'utf8')
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!)
try {
  const { render } = await server.ssrLoadModule('/src/render-static.ts')
  const getFeed = createFeedService(resolve('public'))
  for (const page of document.pages) {
    const feed = await getFeed({ ...page.config, blog: { ...page.config.blog, enabled: page.layout.includes('writing') && page.config.blog.enabled } })
    const markup = await render(page, feed)
    const colors = Object.entries(page.config.theme).map(([key, value]) => `--color-${key}:${value}`).join(';')
    const html = template.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<link[^>]*rel="modulepreload"[^>]*>/g, '').replace(/<noscript>[\s\S]*?<\/noscript>/g, '')
      .replace('<div id="app"></div>', () => `<div id="app">${markup}</div>`)
      .replace(/<html[^>]*>/, () => `<html lang="${escape(page.config.site.lang)}" style="${colors}">`)
      .replace(/<title>.*?<\/title>/, () => `<title>${escape(page.config.site.title)}</title>`)
      .replace(/<meta name="description"[^>]*>/, () => `<meta name="description" content="${escape(page.config.site.description)}" />`)
      .replace(/<meta name="theme-color"[^>]*>/, () => `<meta name="theme-color" content="${page.config.theme.background}" />`)
    const directory = resolve(root, `.${page.route}`)
    await mkdir(directory, { recursive: true })
    await writeFile(resolve(directory, 'index.html'), html)
    console.log(`已生成 ${page.route} → ${page.route.slice(1)}index.html`)
  }
  await rm(resolve(root, 'pages.json'), { force: true })
  console.log(`完成：${document.pages.length} 个完全静态页面，无需运行后端或 JavaScript。`)
} finally { await server.close() }
