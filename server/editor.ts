import { readFile, writeFile, mkdir, rename } from 'node:fs/promises'
import { resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { initialPages, pagesSchema } from '../shared/pages'
import { createFeedService, loadConfig } from './feed-service'
import { configSchema } from '../shared/config'

export async function loadPages(root: string) {
  try { return pagesSchema.parse(JSON.parse(await readFile(resolve(root, 'pages.json'), 'utf8'))) }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; return initialPages(await loadConfig(root)) }
}

export function editorMiddleware(root: string) {
  const getFeed = createFeedService(root)
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const path = req.url?.split('?')[0]
    if (!path?.startsWith('/__edit/api/')) return next()
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    try {
      const origin = req.headers.origin
      if (origin && origin !== `http://${req.headers.host}`) { res.statusCode = 403; res.end(JSON.stringify({ error: '仅允许编辑器同源请求' })); return }
      if (path === '/__edit/api/pages' && req.method === 'GET') { res.end(JSON.stringify(await loadPages(root))); return }
      if (req.method !== 'POST' || req.headers['x-upage-editor'] !== '1') { res.statusCode = 403; res.end(JSON.stringify({ error: '无效编辑请求' })); return }
      const chunks: Buffer[] = []; let size = 0
      for await (const chunk of req) { size += chunk.length; if (size > 12 * 1024 * 1024) throw new Error('内容不能超过 12 MB'); chunks.push(Buffer.from(chunk)) }
      const body = Buffer.concat(chunks)
      if (path === '/__edit/api/feed') {
        const config = await loadConfig(root)
        config.blog = configSchema.shape.blog.parse(JSON.parse(body.toString()))
        res.end(JSON.stringify(await getFeed(config))); return
      }
      if (path === '/__edit/api/pages') {
        const document = pagesSchema.parse(JSON.parse(body.toString()))
        const temp = resolve(root, `pages.${randomUUID()}.tmp`)
        await writeFile(temp, JSON.stringify(document, null, 2))
        await rename(temp, resolve(root, 'pages.json'))
        res.end(JSON.stringify({ ok: true })); return
      }
      if (path === '/__edit/api/upload') {
        const type = req.headers['content-type'] || ''
        const extension = ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif' } as Record<string, string>)[type]
        if (!extension || !body.length) throw new Error('请选择 PNG、JPEG、WebP、GIF 或 AVIF 图片')
        await mkdir(resolve(root, 'assets/uploads'), { recursive: true })
        const name = `${randomUUID()}.${extension}`
        await writeFile(resolve(root, 'assets/uploads', name), body)
        res.end(JSON.stringify({ url: `/assets/uploads/${name}` })); return
      }
      res.statusCode = 404; res.end(JSON.stringify({ error: '接口不存在' }))
    } catch (error) { res.statusCode = 400; res.end(JSON.stringify({ error: error instanceof Error ? error.message : '保存失败' })) }
  }
}
